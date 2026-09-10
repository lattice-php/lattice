<?php
declare(strict_types=1);

namespace Lattice\Media\Forms\Components;

use InvalidArgumentException;
use Lattice\Form\Attributes\AsField;
use Lattice\Media\Components\DropzoneRemove;
use Lattice\Pdf\Components\PdfViewer;
use LogicException;

/**
 * A single-file, upload-only picker whose whole face is the file: empty it is
 * a click-and-drop target, filled it previews the upload in place — a PDF in
 * the document viewer (with lattice-php/pdf installed), an image inline,
 * anything else as its type icon — with the remove control on the preview.
 */
#[AsField(type: 'media-dropzone')]
final class MediaDropzone extends MediaPicker
{
    public string $height = '24rem';

    public ?string $emptyText = null;

    #[\Override]
    public static function make(string $name, ?string $label = null): static
    {
        $field = parent::make($name, $label);
        $field->uploadOnly();

        if (class_exists(PdfViewer::class)) {
            $field->schema([
                ...$field->children,
                PdfViewer::make('media-dropzone-pdf')
                    ->template()
                    ->searchable(false)
                    ->sidebar(false)
                    ->height('100%')
                    ->toolbar([DropzoneRemove::make('media-dropzone-remove')]),
            ]);
        }

        return $field;
    }

    public function height(int|string $height): static
    {
        $height = is_int($height) ? "{$height}px" : trim($height);

        if ($height === '') {
            throw new InvalidArgumentException('MediaDropzone height must not be empty.');
        }

        $this->height = $height;

        return $this;
    }

    public function emptyText(string $text): static
    {
        $this->emptyText = $text;

        return $this;
    }

    #[\Override]
    public function multiple(bool $multiple = true): static
    {
        if ($multiple) {
            throw new LogicException('MediaDropzone holds a single file; use MediaPicker for multiple.');
        }

        return $this;
    }

    #[\Override]
    public function maxFiles(int $maxFiles): static
    {
        throw new LogicException('MediaDropzone holds a single file; use MediaPicker for multiple.');
    }

    #[\Override]
    public function attachmentFields(array $fields): static
    {
        throw new LogicException('MediaDropzone has no attachment fields; use MediaPicker for per-attachment values.');
    }

    #[\Override]
    public function uploadOnly(bool $uploadOnly = true): static
    {
        if (! $uploadOnly) {
            throw new LogicException('MediaDropzone is always upload-only; use MediaPicker to browse the library.');
        }

        return parent::uploadOnly();
    }
}
