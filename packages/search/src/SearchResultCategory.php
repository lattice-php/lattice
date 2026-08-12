<?php
declare(strict_types=1);

namespace Lattice\Search;

use Lattice\Core\Attributes\TypeScript;

#[TypeScript]
final readonly class SearchResultCategory
{
    public function __construct(public string $name) {}
}
