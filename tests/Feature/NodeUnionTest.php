<?php

declare(strict_types=1);

use Lattice\Lattice\Actions\Components\Action;
use Lattice\Lattice\Actions\Components\ActionGroup;
use Lattice\Lattice\Actions\Components\BulkAction;
use Lattice\Lattice\Core\Components\Badge;
use Lattice\Lattice\Core\Components\Button;
use Lattice\Lattice\Core\Components\Card;
use Lattice\Lattice\Core\Components\Grid;
use Lattice\Lattice\Core\Components\Heading;
use Lattice\Lattice\Core\Components\Link;
use Lattice\Lattice\Core\Components\Modal;
use Lattice\Lattice\Core\Components\SegmentedControl;
use Lattice\Lattice\Core\Components\Stack;
use Lattice\Lattice\Core\Components\Tab;
use Lattice\Lattice\Core\Components\Tabs;
use Lattice\Lattice\Core\Components\Text;
use Lattice\Lattice\Fragments\Components\Fragment;

function nodeWireType(string $class): string
{
    $reflection = new ReflectionClass($class);
    $instance = $reflection->newInstanceWithoutConstructor();
    $method = $reflection->getMethod('type');
    $method->setAccessible(true);

    return $method->invoke($instance);
}

function unionBlock(string $name): string
{
    $types = file_get_contents(dirname(__DIR__, 2).'/resources/js/generated/types.ts');

    [, $afterName] = explode("export type {$name} =", $types, 2);
    [$block] = explode("\nexport type ", $afterName, 2);

    return $block;
}

it('keeps every Core component wire type present in the generated CoreNode union', function (string $class): void {
    expect(unionBlock('CoreNode'))->toContain('"'.nodeWireType($class).'"');
})->with([
    Badge::class,
    Button::class,
    Card::class,
    Grid::class,
    Heading::class,
    Link::class,
    Text::class,
    Stack::class,
    SegmentedControl::class,
    Modal::class,
    Tab::class,
    Tabs::class,
]);

it('keeps every Action component wire type present in the generated ActionNode union', function (string $class): void {
    expect(unionBlock('ActionNode'))->toContain('"'.nodeWireType($class).'"');
})->with([
    Action::class,
    ActionGroup::class,
    BulkAction::class,
]);

it('keeps the Fragment wire type present in the generated FragmentNode union', function (): void {
    expect(unionBlock('FragmentNode'))->toContain('"'.nodeWireType(Fragment::class).'"');
});

it('exposes the shared Node union composed of every domain union', function (): void {
    $node = unionBlock('Node');

    expect($node)
        ->toContain('FormNode')
        ->toContain('CoreNode')
        ->toContain('ActionNode')
        ->toContain('FragmentNode');
});
