<?php
declare(strict_types=1);

use Illuminate\Support\Facades\Storage;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Forms\Components\Form;
use Workbench\App\Forms\UploadForm;

use function Pest\Laravel\post;

/**
 * @param  array<string, mixed>  $component
 * @param  array<string, string>  $extra
 * @return array<string, string>
 */
function uploadHeaders(array $component, array $extra = []): array
{
    return ['X-Lattice-Ref' => componentRef($component), ...$extra];
}

it('signs an upload through the form endpoint', function (): void {
    Storage::fake('s3');
    Storage::disk('s3')->buildTemporaryUploadUrlsUsing(
        fn (string $path, $expiration, array $options = []) => ['url' => "https://s3.test/{$path}", 'headers' => []],
    );

    Lattice::forms([UploadForm::class]);

    $form = wire(Form::use(UploadForm::class));

    post('/lattice/forms/workbench.upload.form', ['_upload' => 'document', 'filename' => 'invoice.pdf'], uploadHeaders($form))
        ->assertOk()
        ->assertJsonStructure(['key', 'url', 'headers', 'method']);
});

it('returns 422 when the field does not use signed uploads', function (): void {
    Storage::fake('s3');

    Lattice::forms([UploadForm::class]);

    $form = wire(Form::use(UploadForm::class));

    post('/lattice/forms/workbench.upload.form', ['_upload' => 'avatar', 'filename' => 'photo.jpg'], uploadHeaders($form))
        ->assertStatus(422);
});

it('returns 404 when the upload field does not exist', function (): void {
    Storage::fake('s3');

    Lattice::forms([UploadForm::class]);

    $form = wire(Form::use(UploadForm::class));

    post('/lattice/forms/workbench.upload.form', ['_upload' => 'nonexistent', 'filename' => 'file.pdf'], uploadHeaders($form))
        ->assertNotFound();
});
