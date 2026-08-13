<?php
declare(strict_types=1);

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Validator;
use Lattice\Form\Components\TextInput;
use Lattice\Form\FormData;
use Lattice\Media\Actions\DeleteMediaAction;
use Lattice\Media\Actions\UpdateMediaAction;
use Lattice\Media\Actions\UploadMediaAction;
use Lattice\Media\Forms\Components\MediaPicker;
use Lattice\Media\Models\Media;
use Lattice\Media\Rules\AttachableMedia;
use Lattice\Media\Tables\MediaTable;
use Workbench\App\Forms\ProductMediaForm;
use Workbench\App\Models\Product;

beforeEach(function (): void {
    bootstrapMediaTest(
        tables: [MediaTable::class],
        actions: [UploadMediaAction::class, UpdateMediaAction::class, DeleteMediaAction::class],
        forms: [ProductMediaForm::class],
    );
});

test('hydrateState resolves stored ids to display descriptors in order', function (): void {
    $a = Media::factory()->create();
    $b = Media::factory()->create();

    $field = MediaPicker::make('gallery')->multiple();
    $field->hydrateState([$b->getKey(), $a->getKey()]);
    $selected = $field->selected;
    assert($selected !== null && $selected !== []);

    expect(array_column($selected, 'id'))->toBe([$b->getKey(), $a->getKey()])
        ->and($selected[0]['name'])->toBe($b->name)
        ->and($selected[0]['mime_type'])->toBe($b->mime_type);
});

test('hydrateState drops ids that no longer exist', function (): void {
    $media = Media::factory()->create();

    $field = MediaPicker::make('gallery')->multiple();
    $field->hydrateState([$media->getKey(), 999999]);
    $selected = $field->selected;
    assert($selected !== null);

    expect(array_column($selected, 'id'))->toBe([$media->getKey()]);
});

test('the media picker carries the library as its child schema', function (): void {
    $node = wire(MediaPicker::make('gallery'));

    expect($node['type'])->toBe('field.media-picker')
        ->and($node['props']['multiple'])->toBeFalse()
        ->and($node['schema'][0]['type'])->toBe('media.library')
        ->and($node['schema'][0]['props']['picker'])->toBeTrue();
});

test('picker fluents reach the wire props and the embedded library', function (): void {
    $node = wire(
        MediaPicker::make('file')
            ->category('imports')
            ->uploadOnly()
            ->uploadLabel('Upload import file')
            ->pickerLabel('Choose import'),
    );

    expect($node['props']['uploadOnly'])->toBeTrue()
        ->and($node['props']['pickerLabel'])->toBe('Choose import');

    $library = $node['schema'][0];

    expect($library['type'])->toBe('media.library')
        ->and($library['schema'])->toHaveCount(1)
        ->and($library['schema'][0]['key'])->toBe('media-upload')
        ->and($library['schema'][0]['props']['label'])->toBe('Upload import file');
});

test('an upload through a category-scoped picker stamps the category', function (): void {
    $node = wire(MediaPicker::make('file')->category('imports'));
    $upload = (array) collect((array) $node['schema'][0]['schema'])->firstWhere('key', 'media-upload');

    $this->postJson(
        $upload['props']['endpoint'],
        ['files' => [UploadedFile::fake()->image('import.jpg')]],
        $this->latticeHeaders($upload),
    )->assertOk();

    expect(Media::query()->sole()->category)->toBe('imports');
});

test('the attachable rule rejects unknown ids and accepts existing media', function (): void {
    $fails = fn (mixed $value): bool => Validator::make(
        ['gallery' => $value],
        ['gallery' => [new AttachableMedia]],
    )->fails();

    $media = Media::factory()->create();

    expect($fails($media->getKey()))->toBeFalse()
        ->and($fails(999999))->toBeTrue()
        ->and($fails('not-an-id'))->toBeTrue()
        ->and($fails($media->getKey().'.5'))->toBeTrue();
});

test('a form with a media picker syncs the pivot through HasMedia', function (): void {
    $product = Product::factory()->create();
    $media = Media::factory()->create();

    $this->submitForm(ProductMediaForm::class, [
        'gallery' => [['id' => $media->getKey()]],
    ], ['product_id' => $product->getKey()])->assertRedirect('/media-picker');

    expect($product->media('gallery')->pluck('media.id')->all())->toBe([$media->getKey()]);
});

test('a form with a media picker rejects an id that is not attachable', function (): void {
    $product = Product::factory()->create();

    $this->submitForm(ProductMediaForm::class, [
        'gallery' => [['id' => 999999]],
    ], ['product_id' => $product->getKey()])->assertInvalid(['gallery.0.id']);

    expect($product->media('gallery')->count())->toBe(0);
});

test('attachmentFields serialize as template nodes next to the library', function (): void {
    $node = wire(MediaPicker::make('gallery')->multiple()->attachmentFields([
        TextInput::make('caption', 'Caption'),
    ]));

    expect(array_column($node['schema'], 'type'))->toBe(['media.library', 'field.text-input']);
});

test('attachmentFields with string keys reindex to serialize as list', function (): void {
    /** @phpstan-ignore-next-line argument.type — testing that string-keyed arrays are handled */
    $node = wire(MediaPicker::make('gallery')->multiple()->attachmentFields([
        'caption' => TextInput::make('caption', 'Caption'),
    ]));

    expect(array_column($node['schema'], 'type'))->toBe(['media.library', 'field.text-input']);
});

test('attachmentFields rejects a field named id', function (): void {
    MediaPicker::make('gallery')->attachmentFields([TextInput::make('id')]);
})->throws(LogicException::class);

test('rows are validated per index against id and each attachment field', function (): void {
    $media = Media::factory()->create();
    $field = MediaPicker::make('gallery')->multiple()->attachmentFields([
        TextInput::make('caption')->rules(['string', 'max:10']),
    ]);

    $data = FormData::make(['gallery' => [
        ['id' => $media->getKey(), 'caption' => 'ok'],
        ['id' => 999999, 'caption' => 'far too long for the rule'],
    ]]);

    $validator = Validator::make($data->all(), [
        'gallery' => $field->resolveRules($data, request()),
        ...$field->nestedRules($data, request()),
    ]);

    expect($validator->fails())->toBeTrue()
        ->and($validator->errors()->has('gallery.1.id'))->toBeTrue()
        ->and($validator->errors()->has('gallery.1.caption'))->toBeTrue()
        ->and($validator->errors()->has('gallery.0.id'))->toBeFalse();
});

test('castValue casts rows and unwraps single mode', function (): void {
    $fields = [TextInput::make('caption')];

    $multiple = MediaPicker::make('gallery')->multiple()->attachmentFields($fields);
    $single = MediaPicker::make('cover')->attachmentFields($fields);

    expect($multiple->castValue([['id' => '5', 'caption' => 'x']]))->toBe([['id' => 5, 'caption' => 'x']])
        ->and($single->castValue([['id' => '5', 'caption' => 'x']]))->toBe(['id' => 5, 'caption' => 'x'])
        ->and($single->castValue([]))->toBeNull();
});

test('hydrateState carries row values into the selected descriptors', function (): void {
    $media = Media::factory()->create();
    $field = MediaPicker::make('gallery')->multiple()->attachmentFields([TextInput::make('caption')]);

    $field->hydrateState([['id' => $media->getKey(), 'caption' => 'Front']]);
    $selected = $field->selected;
    assert($selected !== null && $selected !== []);

    expect($selected[0]['id'])->toBe($media->getKey())
        ->and($selected[0]['values'])->toBe(['caption' => 'Front']);
});
