<?php
declare(strict_types=1);

namespace Lattice\Lattice\Http;

use Lattice\Lattice\Attributes\TypeScript;

#[TypeScript]
final readonly class Breadcrumb
{
    public function __construct(
        public string $title,
        public string $href,
    ) {}
}
