<?php
declare(strict_types=1);

namespace Lattice\Core\Values;

use Illuminate\Support\Str;
use Lattice\Core\Services\EndpointAreas;

/**
 * One mount of the component endpoints. The default area serves them below
 * `lattice/`, each behind its own `lattice.{group}.middleware`; a named area
 * ({@see EndpointAreas::register()}) serves the same set below its own prefix,
 * behind its own middleware stack, under route names carrying its name.
 */
final readonly class EndpointArea
{
    /**
     * @param  array<int, string>  $middleware
     */
    private function __construct(
        public ?string $name,
        public string $prefix,
        public array $middleware,
    ) {}

    public static function default(): self
    {
        return new self(null, 'lattice', []);
    }

    /**
     * @param  array<int, string>  $middleware
     */
    public static function named(string $name, string $prefix, array $middleware): self
    {
        return new self($name, trim($prefix, '/'), array_values($middleware));
    }

    public function isDefault(): bool
    {
        return $this->name === null;
    }

    /**
     * The area's name for a default-area route: `lattice.forms.handle`
     * becomes `lattice.account.forms.handle` in the `account` area.
     */
    public function routeName(string $defaultName): string
    {
        if ($this->name === null) {
            return $defaultName;
        }

        return 'lattice.'.$this->name.'.'.Str::after($defaultName, 'lattice.');
    }

    /**
     * `$configKey` names a config value that overrides the whole path in the
     * default area (`lattice.boards.endpoint`); a named area always mounts
     * below its own prefix.
     */
    public function uri(string $path, ?string $configKey = null): string
    {
        $uri = $this->prefix.'/'.$path;

        if ($this->name !== null || $configKey === null) {
            return $uri;
        }

        $configured = config($configKey, $uri);

        return is_string($configured) ? $configured : $uri;
    }

    /**
     * @param  array<int, string>  $fallback
     * @return array<int, string>
     */
    public function middleware(string $group, array $fallback = ['web', 'auth']): array
    {
        if ($this->name !== null) {
            return $this->middleware;
        }

        return array_values((array) config("lattice.{$group}.middleware", $fallback));
    }
}
