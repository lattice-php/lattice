<?php
declare(strict_types=1);

namespace Lattice\Media\Forms\RichEditor;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Gate;
use Lattice\Form\RichContent;
use Lattice\Form\RichEditor\Attributes\AsEditorExtension;
use Lattice\Form\RichEditor\EditorExtension;
use Lattice\Media\Components\MediaLibrary;
use Lattice\Media\Models\Media;
use Symfony\Component\HtmlSanitizer\HtmlSanitizerConfig;

/**
 * Rich-editor extension for inserting library media as images. The document
 * stores `{id, alt, conversion}` per node; URLs are resolved on the way out
 * (prepareDocument) and never persisted, so temporary/signed disk URLs work.
 */
#[AsEditorExtension('media-image')]
class MediaImage extends EditorExtension
{
    /**
     * Conversion names offered in the node's size picker; empty means the
     * original only. Unknown names fall back to the original at render time.
     *
     * @var list<string>
     */
    public array $conversions = [];

    /** The picker dialog the toolbar button renders, as a wire component. */
    public ?MediaLibrary $library = null;

    #[\Override]
    public static function make(): static
    {
        $extension = parent::make();
        $extension->library = MediaLibrary::make('rich-editor-media-library')->picker()->accept('image/*');

        return $extension;
    }

    public function conversions(string ...$conversions): static
    {
        $this->conversions = array_values($conversions);

        return $this;
    }

    #[\Override]
    public function serverExtensions(): array
    {
        return [new MediaImageNode];
    }

    #[\Override]
    public function ephemeralAttributes(): array
    {
        return ['mediaImage' => ['url', 'width', 'height', 'mediaAlt']];
    }

    #[\Override]
    public function configureSanitizer(HtmlSanitizerConfig $config): HtmlSanitizerConfig
    {
        return $config
            ->allowElement('img', ['src', 'alt', 'width', 'height', 'loading', 'data-media-id', 'data-conversion'])
            ->allowMediaSchemes(['https', 'http'])
            ->allowRelativeMedias();
    }

    #[\Override]
    public function prepareDocument(array $document): array
    {
        $ids = self::idsFromNodes(RichContent::make($document, extensions: [$this])->nodes('mediaImage'));

        if ($ids === []) {
            return $document;
        }

        $media = Media::modelQuery()->findMany($ids)
            ->keyBy(static fn (Media $item): int => (int) $item->getKey());

        return $this->resolve($document, $media);
    }

    #[\Override]
    public function validateDocument(array $document): array
    {
        $ids = self::idsFromNodes(RichContent::make($document, extensions: [$this])->nodes('mediaImage'));

        if ($ids === []) {
            return [];
        }

        $media = Media::modelQuery()->findMany($ids)
            ->keyBy(static fn (Media $item): int => (int) $item->getKey());
        $errors = [];

        foreach ($ids as $id) {
            $item = $media->get($id);

            if (! $item instanceof Media || Gate::denies('attach', $item) || ! $item->isImage()) {
                $errors[] = __('media::media.editor.not-attachable', ['id' => $id]);
            }
        }

        return $errors;
    }

    /**
     * Media ids referenced by a stored document — feed for
     * `HasMedia::syncMedia()` after persisting the document. Uses the
     * app-wide registry, so it works on bare stored values.
     *
     * @param  array<string, mixed>|string|null  $document
     * @return list<int>
     */
    public static function idsIn(array|string|null $document): array
    {
        return self::idsFromNodes(RichContent::make($document)->nodes('mediaImage'));
    }

    /**
     * @param  list<array<string, mixed>>  $nodes
     * @return list<int>
     */
    private static function idsFromNodes(array $nodes): array
    {
        return array_values(array_unique(array_filter(array_map(
            static fn (array $node): int => (int) ($node['attrs']['id'] ?? 0),
            $nodes,
        ))));
    }

    /**
     * @param  array<string, mixed>  $node
     * @param  Collection<array-key, Media>  $media
     * @return array<string, mixed>
     */
    private function resolve(array $node, Collection $media): array
    {
        if (($node['type'] ?? null) === 'mediaImage') {
            $item = $media->get((int) ($node['attrs']['id'] ?? 0));

            if ($item instanceof Media) {
                $conversion = $node['attrs']['conversion'] ?? null;
                $conversion = is_string($conversion) ? $conversion : null;
                $dimensions = $conversion !== null ? $item->conversions()[$conversion] ?? null : null;

                $node['attrs']['url'] = $item->url($conversion);
                $node['attrs']['width'] = $dimensions['width'] ?? $item->width;
                $node['attrs']['height'] = $dimensions['height'] ?? $item->height;
                $node['attrs']['mediaAlt'] = $item->alt;
            }
        }

        if (isset($node['content']) && is_array($node['content'])) {
            $node['content'] = array_values(array_map(
                fn (array $child): array => $this->resolve($child, $media),
                array_filter($node['content'], is_array(...)),
            ));
        }

        return $node;
    }
}
