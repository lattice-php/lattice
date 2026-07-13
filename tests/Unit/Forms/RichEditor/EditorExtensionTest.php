<?php
declare(strict_types=1);

use Lattice\Lattice\Forms\RichEditor\Attributes\AsEditorExtension;
use Lattice\Lattice\Forms\RichEditor\EditorExtension;

#[AsEditorExtension('plain')]
final class PlainSampleExtension extends EditorExtension {}

#[AsEditorExtension('configurable')]
final class ConfigurableSampleExtension extends EditorExtension
{
    /**
     * @var list<int>
     */
    public array $levels = [1, 2];
}

it('wires empty props as an object', function (): void {
    expect(PlainSampleExtension::make()->toWire())->toEqual(['type' => 'plain', 'props' => new stdClass]);
});

it('wires its public properties as props', function (): void {
    expect(ConfigurableSampleExtension::make()->toWire())->toBe([
        'type' => 'configurable',
        'props' => ['levels' => [1, 2]],
    ]);
});

it('serializes to its wire shape', function (): void {
    $extension = ConfigurableSampleExtension::make();

    expect($extension->jsonSerialize())->toBe($extension->toWire());
});

it('reads its wire type from the attribute', function (): void {
    expect(PlainSampleExtension::make()->wireType())->toBe('plain');
});
