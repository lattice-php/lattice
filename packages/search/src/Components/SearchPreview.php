<?php
declare(strict_types=1);

namespace Lattice\Search\Components;

use Lattice\Core\Attributes\AsComponent;
use Lattice\Ui\Components\Component;

#[AsComponent('search.preview')]
class SearchPreview extends Component
{
    public static function make(?string $key = null): static
    {
        return new static($key);
    }
}
