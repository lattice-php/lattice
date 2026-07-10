<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Contracts;

interface Renderable
{
    public function shouldRender(): bool;
}
