<?php
declare(strict_types=1);

use Lattice\Media\Actions\UploadMediaAction;
use Lattice\Media\Forms\Components\MediaDropzone;
use Lattice\Media\Models\Media;

beforeEach(function (): void {
    bootstrapMediaTest(actions: [UploadMediaAction::class]);
});

test('the dropzone is a single upload-only picker with a face height and empty text', function (): void {
    $node = wire(MediaDropzone::make('document', 'Document')->height(600)->emptyText('Drop the invoice here'));

    expect($node['type'])->toBe('field.media-dropzone')
        ->and($node['props'])->toMatchArray([
            'name' => 'document',
            'multiple' => false,
            'uploadOnly' => true,
            'height' => '600px',
            'emptyText' => 'Drop the invoice here',
        ]);

    $library = collect((array) $node['schema'])->firstWhere('type', 'media.library');

    expect($library)->not->toBeNull()
        ->and(collect((array) $library['schema'])->pluck('type')->all())->toBe(['action'])
        ->and(collect((array) $library['schema'])->firstWhere('key', 'media-upload'))->not->toBeNull();
});

test('the dropzone composes a document viewer template carrying the remove control in its toolbar', function (): void {
    $node = wire(MediaDropzone::make('document'));

    $viewer = collect((array) $node['schema'])->firstWhere('key', 'media-dropzone-pdf');

    expect($viewer)->not->toBeNull()
        ->and($viewer['type'])->toBe('pdf')
        ->and($viewer['props'])->toMatchArray(['url' => '', 'height' => '100%', 'sidebar' => false, 'searchable' => false])
        ->and($viewer['schema'][0]['type'])->toBe('media.dropzone-remove');
});

test('a stored id hydrates to one display descriptor', function (): void {
    $media = fakeImageMedia();

    $field = MediaDropzone::make('document');
    $field->hydrateState($media->getKey());

    $selected = $field->selected;
    assert($selected !== null && $selected !== []);

    expect($selected)->toHaveCount(1)
        ->and($selected[0])->toMatchArray([...$media->descriptor(), 'values' => []])
        ->and($field->castValue($media->getKey()))->toBe($media->getKey());
});

test('the dropzone refuses picker features it cannot render', function (): void {
    expect(fn (): MediaDropzone => MediaDropzone::make('document')->multiple())->toThrow(LogicException::class)
        ->and(fn (): MediaDropzone => MediaDropzone::make('document')->maxFiles(2))->toThrow(LogicException::class)
        ->and(fn (): MediaDropzone => MediaDropzone::make('document')->attachmentFields([]))->toThrow(LogicException::class)
        ->and(fn (): MediaDropzone => MediaDropzone::make('document')->uploadOnly(false))->toThrow(LogicException::class)
        ->and(fn (): MediaDropzone => MediaDropzone::make('document')->height(' '))->toThrow(InvalidArgumentException::class);
});

test('the dropzone keeps the picker validation for a single attachable id', function (): void {
    $media = Media::factory()->create();
    $field = MediaDropzone::make('document')->rules(['nullable', 'integer']);

    expect($field->name())->toBe('document')
        ->and($field->castValue(null))->toBeNull()
        ->and($field->castValue($media->getKey()))->toBe($media->getKey());
});
