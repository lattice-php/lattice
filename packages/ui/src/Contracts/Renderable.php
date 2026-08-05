<?php
declare(strict_types=1);

namespace Lattice\Ui\Contracts;

interface Renderable
{
    public function shouldRender(): bool;
}
