<?php

declare(strict_types=1);

namespace Workbench\App\Support;

use Illuminate\Support\Str;
use Laravel\Boost\Support\Config;

use function Orchestra\Testbench\package_path;

class BoostConfig extends Config
{
    protected function path(): string
    {
        return package_path(self::FILE);
    }

    #[\Override]
    public function isValid(): bool
    {
        $path = $this->path();

        if (! file_exists($path)) {
            return false;
        }

        json_decode((string) file_get_contents($path), true);

        return json_last_error() === JSON_ERROR_NONE;
    }

    #[\Override]
    public function flush(): void
    {
        $path = $this->path();

        if (file_exists($path)) {
            unlink($path);
        }
    }

    #[\Override]
    protected function set(string $key, mixed $value): void
    {
        $config = array_filter($this->all(), fn ($value): bool => $value !== null && $value !== []);

        data_set($config, $key, $value);

        ksort($config);

        file_put_contents(
            $this->path(),
            Str::of(json_encode($config, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES))->append(PHP_EOL),
        );
    }

    /**
     * @return array<string, mixed>
     */
    #[\Override]
    protected function all(): array
    {
        $path = $this->path();

        if (! file_exists($path)) {
            return [];
        }

        $config = json_decode((string) file_get_contents($path), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            return [];
        }

        return $config ?? [];
    }
}
