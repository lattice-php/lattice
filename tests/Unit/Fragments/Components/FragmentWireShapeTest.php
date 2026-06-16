<?php
declare(strict_types=1);

use Lattice\Lattice\Attributes\Fragment as FragmentAttribute;
use Lattice\Lattice\Core\Components\Text;
use Lattice\Lattice\Core\Enums\Size;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Fragments\Components\Fragment;
use Lattice\Lattice\Fragments\FragmentDefinition;

it('serializes a fragment with an endpoint and injected ref', function (): void {
    $fragment = Fragment::make('demo')
        ->endpoint('/lattice/fragments/demo')
        ->schema([Text::make('hello')]);

    $payload = wire($fragment);

    expect($payload['type'])->toBe('fragment');
    expect($payload['id'])->toBe('demo');
    expect($payload['props']['endpoint'])->toBe('/lattice/fragments/demo');
    expect($payload['props']['ref'])->toBeString();
    expect($payload['props']['ref'])->not->toBe('');
    expect($payload['props']['lazy'])->toBeNull();
    expect($payload['props']['size'])->toBe('md');
    expect($payload['props'])->not->toHaveKey('context');
    expect($payload)->toHaveKey('schema');
});

it('serializes a lazy fragment via the registry with lazy and endpoint props', function (): void {
    Lattice::fragments([FragmentWireShapePanel::class]);

    $fragment = wire(Fragment::lazy(FragmentWireShapePanel::class));

    expect($fragment['type'])->toBe('fragment');
    expect($fragment['id'])->toBe('wire-shape.panel');
    expect($fragment['props']['endpoint'])->toBe('/lattice/fragments/wire-shape.panel');
    expect($fragment['props']['lazy'])->toBe(true);
    expect($fragment['props']['size'])->toBe('md');
    expect($fragment['props']['ref'])->toBeString();
    expect($fragment['props']['ref'])->not->toBe('');
});

it('serializes a configured lazy fragment size', function (): void {
    Lattice::fragments([FragmentWireShapePanel::class]);

    $fragment = wire(Fragment::lazy(FragmentWireShapePanel::class)->size(Size::Lg));

    expect($fragment['props']['size'])->toBe('lg');
});

it('includes lazy and endpoint as null on a fragment that is not lazy-loaded', function (): void {
    $fragment = Fragment::make('plain');

    $payload = wire($fragment);

    expect($payload['props']['lazy'])->toBeNull();
    expect($payload['props']['endpoint'])->toBeNull();
    expect($payload['props']['size'])->toBe('md');
});

#[FragmentAttribute('wire-shape.panel')]
final class FragmentWireShapePanel extends FragmentDefinition
{
    public function schema(PageSchema $schema): PageSchema
    {
        return $schema->component(Text::make('Wire shape panel.'));
    }
}
