<?php
declare(strict_types=1);

namespace Lattice\Lattice\Http;

use Lattice\Lattice\Attributes\TypeScript;
use Lattice\Lattice\Ui\Components\Component;

/**
 * A page's resolved layout: the layout key plus its rendered component tree,
 * whose schema contains exactly one Outlet marking where the page renders.
 */
#[TypeScript]
final readonly class PageLayoutPayload
{
    /**
     * @param  array<int, Component>  $schema
     */
    public function __construct(
        public string $key,
        public array $schema,
    ) {}
}
