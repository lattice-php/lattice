<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Components\Stack;
use Lattice\Lattice\Core\Enums\Justify;

it('serializes the justify prop', function (): void {
    $node = wire(Stack::make()->justify(Justify::Between));

    expect($node['props']['justify'])->toBe('between');
});
