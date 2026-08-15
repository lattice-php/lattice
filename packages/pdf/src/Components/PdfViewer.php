<?php

declare(strict_types=1);

namespace Lattice\Pdf\Components;

use Closure;
use InvalidArgumentException;
use Lattice\Core\Attributes\AsComponent;
use Lattice\Core\Attributes\SerializationHook;
use Lattice\Core\Facades\Evaluate;
use Lattice\Ui\Components\Component;

#[AsComponent('pdf')]
final class PdfViewer extends Component
{
    public string $url = '';

    public string $workerUrl = '';

    public ?string $filename = null;

    public bool $downloadable = true;

    public bool $searchable = true;

    public int $height = 720;

    public ?float $initialZoom = null;

    public ?string $cmapUrl = null;

    public ?string $standardFontDataUrl = null;

    public ?string $wasmUrl = null;

    private Closure|string|null $urlSource = null;

    public static function make(?string $key = null): static
    {
        return new self($key);
    }

    public function url(Closure|string $url): static
    {
        $this->urlSource = $url;

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

    public function height(int $height): static
    {
        if ($height < 240) {
            throw new InvalidArgumentException('PdfViewer height must be at least 240 pixels.');
        }

        $this->height = $height;

        return $this;
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
        if ($this->urlSource === null) {
            throw new InvalidArgumentException('PdfViewer requires a document url.');
        }

        $url = $this->urlSource instanceof Closure
            ? Evaluate::resolve($this->urlSource, Evaluate::context())
            : $this->urlSource;

        if (! is_string($url) || trim($url) === '') {
            throw new InvalidArgumentException('PdfViewer url must resolve to a non-empty string.');
        }

        $this->url = $url;
        $this->workerUrl = $this->resolveWorkerUrl();
        $this->cmapUrl ??= $this->configuredUrl('pdf.cmap_url');
        $this->standardFontDataUrl ??= $this->configuredUrl('pdf.standard_font_data_url');
        $this->wasmUrl ??= $this->configuredUrl('pdf.wasm_url');

        return $data;
    }

    private function resolveWorkerUrl(): string
    {
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
