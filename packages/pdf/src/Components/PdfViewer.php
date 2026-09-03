<?php

declare(strict_types=1);

namespace Lattice\Pdf\Components;

use Closure;
use InvalidArgumentException;
use Lattice\Core\Attributes\AsComponent;
use Lattice\Core\Attributes\SerializationHook;
use Lattice\Core\Facades\Evaluate;
use Lattice\Media\Models\Media;
use Lattice\Ui\Components\Component;
use LogicException;

#[AsComponent('pdf')]
final class PdfViewer extends Component
{
    public string $url = '';

    public string $workerUrl = '';

    public ?string $filename = null;

    public bool $downloadable = true;

    public bool $searchable = true;

    public bool $sidebar = true;

    public string $height = '80vh';

    public ?string $maxHeight = null;

    public ?float $initialZoom = null;

    public ?string $cmapUrl = null;

    public ?string $standardFontDataUrl = null;

    public ?string $wasmUrl = null;

    private Closure|string|null $urlSource = null;

    private bool $template = false;

    private ?string $workerUrlOverride = null;

    public static function make(?string $key = null): static
    {
        return new self($key);
    }

    public function url(Closure|string $url): static
    {
        $this->urlSource = $url;

        return $this;
    }

    /**
     * Sources the document from a lattice-php/media attachment: the signed
     * URL and filename resolve freshly on every serialization because media
     * URLs are temporary.
     */
    public function media(int|object $media): static
    {
        if (! class_exists(Media::class)) {
            throw new LogicException('PdfViewer::media() requires the lattice-php/media package.');
        }

        if (is_object($media) && ! $media instanceof Media) {
            throw new InvalidArgumentException('PdfViewer::media() expects a media id or a '.Media::class.' instance.');
        }

        $this->urlSource = function () use ($media): string {
            $model = $media instanceof Media ? $media : Media::modelQuery()->findOrFail($media);
            $url = $model->url();

            if (! is_string($url) || $url === '') {
                throw new InvalidArgumentException("PdfViewer media [{$model->getKey()}] has no resolvable url.");
            }

            $this->filename ??= $model->name;

            return $url;
        };

        return $this;
    }

    /**
     * Serializes the viewer without a document. The embedding client supplies
     * `url` (and `filename`) per instance — a media library rendering the
     * viewer for whichever file is selected, say — so this node carries the
     * worker and config urls and nothing else.
     */
    public function template(bool $template = true): static
    {
        $this->template = $template;

        return $this;
    }

    public function sidebar(bool $enabled = true): static
    {
        $this->sidebar = $enabled;

        return $this;
    }

    public function filename(string $filename): static
    {
        $filename = trim($filename);

        if ($filename === '') {
            throw new InvalidArgumentException('PdfViewer filename must not be empty.');
        }

        $this->filename = $filename;

        return $this;
    }

    public function downloadable(bool $enabled = true): static
    {
        $this->downloadable = $enabled;

        return $this;
    }

    public function searchable(bool $enabled = true): static
    {
        $this->searchable = $enabled;

        return $this;
    }

    public function height(int|string $height): static
    {
        $this->height = $this->cssLength($height, 'height');

        return $this;
    }

    public function maxHeight(int|string $maxHeight): static
    {
        $this->maxHeight = $this->cssLength($maxHeight, 'maxHeight');

        return $this;
    }

    private function cssLength(int|string $value, string $property): string
    {
        if (is_int($value)) {
            if ($value < 240) {
                throw new InvalidArgumentException("PdfViewer {$property} must be at least 240 pixels.");
            }

            return "{$value}px";
        }

        $value = trim($value);

        if (preg_match('/^\d+(\.\d+)?(px|rem|em|vh|svh|dvh|lvh|vw|%)$/', $value) !== 1) {
            throw new InvalidArgumentException("PdfViewer {$property} must be a CSS length such as 600px, 80vh, or 100%.");
        }

        return $value;
    }

    public function zoom(float $zoom): static
    {
        if ($zoom < 0.25 || $zoom > 4.0) {
            throw new InvalidArgumentException('PdfViewer zoom must be between 0.25 and 4.0.');
        }

        $this->initialZoom = $zoom;

        return $this;
    }

    public function fitWidth(): static
    {
        $this->initialZoom = null;

        return $this;
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    #[SerializationHook(priority: 190)]
    protected function preparePdf(array $data): array
    {
        if ($this->urlSource === null && ! $this->template) {
            throw new InvalidArgumentException('PdfViewer requires a document url.');
        }

        if ($this->urlSource !== null) {
            $url = $this->urlSource instanceof Closure
                ? Evaluate::resolve($this->urlSource, Evaluate::context())
                : $this->urlSource;

            if (! is_string($url) || trim($url) === '') {
                throw new InvalidArgumentException('PdfViewer url must resolve to a non-empty string.');
            }

            $this->url = $url;
        }

        $this->workerUrl = $this->resolveWorkerUrl();
        $this->cmapUrl ??= $this->configuredUrl('pdf.cmap_url');
        $this->standardFontDataUrl ??= $this->configuredUrl('pdf.standard_font_data_url');
        $this->wasmUrl ??= $this->configuredUrl('pdf.wasm_url');

        return $data;
    }

    /**
     * Overrides the worker script URL for this viewer, taking precedence over
     * config('pdf.worker_url') and the packaged worker route. Useful where the
     * packaged route is unreachable (static previews, strict CSPs).
     */
    public function workerUrl(string $url): static
    {
        $this->workerUrlOverride = $url;

        return $this;
    }

    private function resolveWorkerUrl(): string
    {
        if ($this->workerUrlOverride !== null) {
            return $this->workerUrlOverride;
        }

        $configured = $this->configuredUrl('pdf.worker_url');

        if ($configured !== null) {
            return $configured;
        }

        $version = $this->distVersion();

        return route('lattice.pdf.worker', $version === null ? [] : ['v' => $version]);
    }

    private function configuredUrl(string $key): ?string
    {
        $value = config($key);

        return is_string($value) && $value !== '' ? $value : null;
    }

    private function distVersion(): ?string
    {
        $manifest = dirname(__DIR__, 2).'/dist/manifest.json';

        if (! is_file($manifest)) {
            return null;
        }

        $decoded = json_decode((string) file_get_contents($manifest), true);

        return is_array($decoded) && is_string($decoded['version'] ?? null) ? $decoded['version'] : null;
    }
}
