<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Components;

use Lattice\Lattice\Attributes\TypeScript;
use Lattice\Lattice\Core\Enums\HttpMethod;

#[TypeScript]
final readonly class SignedUpload
{
    /**
     * @param  array<string, mixed>  $headers
     */
    public function __construct(
        public string $key,
        public string $url,
        public array $headers,
        public HttpMethod $method,
    ) {}
}
