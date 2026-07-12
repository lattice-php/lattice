<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Components;

use Lattice\Lattice\Attributes\TypeScript;

/**
 * The signed direct-upload the file-upload endpoint hands back: the object key the
 * client stores and the pre-signed request it PUTs the file with.
 */
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
        public string $method,
    ) {}
}
