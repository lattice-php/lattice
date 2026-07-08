<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Contracts;

interface Renderable
{
    public function shouldRender(): bool;
}
