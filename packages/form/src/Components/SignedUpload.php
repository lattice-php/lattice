<?php
declare(strict_types=1);

namespace Lattice\Form\Components;

use Lattice\Core\Attributes\TypeScript;
use Lattice\Ui\Enums\HttpMethod;

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
