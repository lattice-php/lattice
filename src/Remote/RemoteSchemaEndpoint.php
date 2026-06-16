<?php
declare(strict_types=1);

namespace Lattice\Lattice\Remote;

final readonly class RemoteSchemaEndpoint
{
    /**
     * @param  list<string>  $allowedHosts
     */
    private function __construct(
        public string $uri,
        public array $allowedHosts,
        public float $timeout,
        public float $connectTimeout,
    ) {}

    /**
     * @param  list<string>  $allowedHosts
     */
    public static function url(
        string $url,
        array $allowedHosts = [],
        float $timeout = 2.0,
        float $connectTimeout = 1.0,
    ): self {
        return new self($url, $allowedHosts, $timeout, $connectTimeout);
    }

    public static function file(string $path): self
    {
        return new self('file://'.$path, [], 0.0, 0.0);
    }

    public function isFile(): bool
    {
        return str_starts_with($this->uri, 'file://');
    }

    public function path(): string
    {
        return substr($this->uri, strlen('file://'));
    }
}
