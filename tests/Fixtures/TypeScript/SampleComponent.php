<?php
declare(strict_types=1);

namespace Lattice\Tests\Fixtures\TypeScript;

use Lattice\Actions\Components\Action;
use Lattice\Core\Attributes\AsComponent;
use Lattice\Ui\Components\ContainerComponent;

#[AsComponent('sample.widget')]
class SampleComponent extends ContainerComponent
{
    public ?Action $trigger = null;
}
