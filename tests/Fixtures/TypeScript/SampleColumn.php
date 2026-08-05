<?php
declare(strict_types=1);

namespace Lattice\Tests\Fixtures\TypeScript;

use Lattice\Table\Attributes\AsColumn;
use Lattice\Table\Columns\Column;

#[AsColumn(type: 'rating')]
class SampleColumn extends Column
{
    public int $max = 5;

    public function max(int $max): static
    {
        $this->max = $max;

        return $this;
    }
}
