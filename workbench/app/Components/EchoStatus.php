<?php

declare(strict_types=1);

namespace Workbench\App\Components;

use Lattice\Core\Attributes\AsComponent;
use Lattice\Ui\Components\Component;

#[AsComponent('echo-status')]
final class EchoStatus extends Component
{
    public static function make(?string $key = null): static
    {
        return new self($key);
    }
}
