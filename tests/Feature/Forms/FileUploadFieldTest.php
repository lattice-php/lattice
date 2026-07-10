<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Lattice\Lattice\Core\Contracts\SignsComponentReferences;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Forms\Components\FileUpload;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Forms\Components\Repeater;
use Lattice\Lattice\Forms\FormDefinition;
use Symfony\Component\HttpFoundation\Response;
use Workbench\App\Forms\UploadForm;

use function Pest\Laravel\post;

it('signs an upload through the form endpoint', function (): void {
    Storage::fake('s3');
    Storage::disk('s3')->buildTemporaryUploadUrlsUsing(
        fn (string $path, $expiration, array $options = []): array => ['url' => "https://s3.test/{$path}", 'headers' => []],
    );

    Lattice::forms([UploadForm::class]);

    $this->submitForm(UploadForm::class, ['_upload' => 'document', 'filename' => 'invoice.pdf'])
        ->assertOk()
        ->assertJsonStructure(['key', 'url', 'headers', 'method']);
});

it('signs an upload for a file field inside a repeater row', function (): void {
    Storage::fake('s3');
    Storage::disk('s3')->buildTemporaryUploadUrlsUsing(
        fn (string $path, $expiration, array $options = []): array => ['url' => "https://s3.test/{$path}", 'headers' => []],
    );

    Lattice::forms([UploadForm::class]);

    $this->submitForm(UploadForm::class, [
        '_upload' => 'documents.0.file',
        'filename' => 'invoice.pdf',
        'documents' => [
            ['file' => null],
        ],
    ])
        ->assertOk()
        ->assertJsonStructure(['key', 'url', 'headers', 'method']);
});

it('signs an upload for a file field inside nested repeater rows', function (): void {
    Storage::fake('s3');
    Storage::disk('s3')->buildTemporaryUploadUrlsUsing(
        fn (string $path, $expiration, array $options = []): array => ['url' => "https://s3.test/{$path}", 'headers' => []],
    );

    $definition = new class extends FormDefinition
    {
        public function definition(Form $form, Request $request): Form
        {
            return $form->schema([
                Repeater::make('sections')->schema([
                    Repeater::make('documents')->schema([
                        FileUpload::make('file')->disk('s3')->signedUpload(),
                    ]),
                ]),
            ]);
        }

        public function handle(Request $request): Response
        {
            return new Response('ok');
        }
    };

    $result = $definition->signUpload(Request::create('/', 'POST', [
        '_upload' => 'sections.0.documents.0.file',
        'filename' => 'invoice.pdf',
        'sections' => [[
            'documents' => [
                ['file' => null],
            ],
        ]],
    ]));

    expect($result)->toHaveKeys(['key', 'url', 'headers', 'method']);
});

it('returns 422 when the field does not use signed uploads', function (): void {
    Storage::fake('s3');

    Lattice::forms([UploadForm::class]);

    $this->submitForm(UploadForm::class, ['_upload' => 'avatar', 'filename' => 'photo.jpg'])
        ->assertUnprocessable();
});

it('returns 404 when the upload field does not exist', function (): void {
    Storage::fake('s3');

    Lattice::forms([UploadForm::class]);

    $this->submitForm(UploadForm::class, ['_upload' => 'nonexistent', 'filename' => 'file.pdf'])
        ->assertNotFound();
});

it('stores a multipart upload through the form', function (): void {
    Storage::fake('public');

    Lattice::forms([UploadForm::class]);

    $this->submitForm(UploadForm::class, [
        'avatar' => UploadedFile::fake()->image('me.jpg'),
    ])
        ->assertRedirect('/uploads');

    $stored = session('upload')['avatar'];

    expect($stored)->toBeString();

    Storage::disk('public')->assertExists($stored);
});

it('rejects a multipart image upload that exceeds maxSize', function (): void {
    Storage::fake('public');

    Lattice::forms([UploadForm::class]);

    $form = wire(Form::use(UploadForm::class));

    post('/lattice/forms/workbench.upload.form', [
        'avatar' => UploadedFile::fake()->create('huge.jpg', 5000, 'image/jpeg'),
    ], $this->latticeHeaders($form))
        ->assertSessionHasErrors(['avatar']);
});

it('accepts a signed tmp key that exists and rejects an out-of-prefix key', function (): void {
    Storage::fake('s3');
    Storage::disk('s3')->put('tmp/real.pdf', 'data');
    Storage::disk('s3')->put('uploads/secret.pdf', 'data');

    Lattice::forms([UploadForm::class]);

    $form = wire(Form::use(UploadForm::class));

    post('/lattice/forms/workbench.upload.form', ['document' => 'tmp/real.pdf'], $this->latticeHeaders($form))
        ->assertRedirect('/uploads');

    post('/lattice/forms/workbench.upload.form', ['document' => 'uploads/secret.pdf'], $this->latticeHeaders($form))
        ->assertSessionHasErrors(['document']);
});

it('deletes an existing file when its removal token is submitted', function (): void {
    Storage::fake('public');
    Storage::disk('public')->put('uploads/old.jpg', 'data');
    $signer = app(SignsComponentReferences::class);
    $token = $signer->seal('file', 'avatar', ['disk' => 'public', 'path' => 'uploads/old.jpg']);

    Lattice::forms([UploadForm::class]);

    $this->submitForm(UploadForm::class, ['avatar__removed' => [$token]])
        ->assertRedirect('/uploads');

    Storage::disk('public')->assertMissing('uploads/old.jpg');
});

it('ignores a forged removal token (no deletion)', function (): void {
    Storage::fake('public');
    Storage::disk('public')->put('uploads/keep.jpg', 'data');

    Lattice::forms([UploadForm::class]);

    $this->submitForm(UploadForm::class, ['avatar__removed' => ['forged']])
        ->assertRedirect('/uploads');

    Storage::disk('public')->assertExists('uploads/keep.jpg');
});
