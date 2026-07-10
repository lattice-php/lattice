<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Option;
use Lattice\Lattice\Effects\Builtin\ToastEffect;
use Lattice\Lattice\I18n\Values\Translatable;
use Lattice\Lattice\Remote\Components\DataList;
use Lattice\Lattice\Support\TypeScript\DiscoveredComponent;
use Lattice\Lattice\Support\TypeScript\WireTypeDiscovery;
use Lattice\Lattice\Tables\Columns\TextColumn;
use Lattice\Lattice\Tests\Fixtures\TypeScript\SampleColumn;
use Lattice\Lattice\Tests\Fixtures\TypeScript\SampleDualMarkedA;
use Lattice\Lattice\Tests\Fixtures\TypeScript\SampleDualMarkedB;
use Lattice\Lattice\Tests\Fixtures\TypeScript\SampleUnattributed;
use Lattice\Lattice\Ui\Components\Card;
use Lattice\Lattice\Ui\Enums\Align;
use Lattice\Lattice\Ui\Enums\Variant;
use Lattice\Lattice\Ui\Values\ToastMessage;

it('classifies the src tree into enums, value objects, components and effects', function (): void {
    $manifest = new WireTypeDiscovery()->discover(dirname(__DIR__, 3).'/src');

    expect($manifest->effects)->toHaveKey(ToastEffect::class, 'toast')
        ->and($manifest->enums)->toContain(Variant::class)
        ->and($manifest->valueObjects)->toContain(Translatable::class)
        ->and($manifest->valueObjects)->not->toContain(ToastEffect::class)
        ->and(collect($manifest->components)->firstWhere('class', TextColumn::class)?->category)->toBe('column');
});

it('returns an empty manifest for a missing path', function (): void {
    $manifest = new WireTypeDiscovery()->discover('/nonexistent');

    expect($manifest->enums)->toBe([])
        ->and($manifest->valueObjects)->toBe([])
        ->and($manifest->components)->toBe([])
        ->and($manifest->effects)->toBe([]);
});

it('discovers attributed components under a path with type, flags and category', function (): void {
    $manifest = new WireTypeDiscovery()->discover(__DIR__.'/../../Fixtures/TypeScript');

    $byType = collect($manifest->components)->keyBy->type;

    expect($byType)->toHaveKey('sample.widget')->toHaveKey('field.sample');

    $widget = $byType->get('sample.widget');
    $field = $byType->get('field.sample');

    assert($widget instanceof DiscoveredComponent);
    assert($field instanceof DiscoveredComponent);

    expect($widget->container)->toBeTrue()
        ->and($widget->category)->toBe('component')
        ->and($field->category)->toBe('component');
});

it('excludes classes without the AsComponent attribute from component discovery', function (): void {
    $manifest = new WireTypeDiscovery()->discover(__DIR__.'/../../Fixtures/TypeScript');

    $types = collect($manifest->components)->pluck('type')->all();

    expect($types)->not->toContain('SampleUnattributed');

    $classes = collect($manifest->components)->pluck('class')->all();
    expect($classes)->not->toContain(SampleUnattributed::class);
});

it('classifies dual-marked classes as components regardless of attribute declaration order', function (): void {
    $manifest = new WireTypeDiscovery()->discover(__DIR__.'/../../Fixtures/TypeScript');

    $classes = collect($manifest->components)->pluck('class')->all();

    expect($classes)->toContain(SampleDualMarkedA::class)
        ->and($classes)->toContain(SampleDualMarkedB::class)
        ->and($manifest->valueObjects)->not->toContain(SampleDualMarkedA::class)
        ->and($manifest->valueObjects)->not->toContain(SampleDualMarkedB::class)
        ->and($manifest->enums)->not->toContain(SampleDualMarkedA::class)
        ->and($manifest->enums)->not->toContain(SampleDualMarkedB::class);
});

it('derives the domain from the namespace segment before Components', function (): void {
    $manifest = new WireTypeDiscovery()->discover(dirname(__DIR__, 3).'/src/Ui/Components');

    $card = collect($manifest->components)->keyBy->type->get('card');

    assert($card instanceof DiscoveredComponent);

    expect($card->domain)->toBe('Ui');
});

it('discovers columns via attribute inheritance and captures the column class', function (): void {
    $manifest = new WireTypeDiscovery()->discover(__DIR__.'/../../Fixtures/TypeScript');

    $column = collect($manifest->components)->keyBy->type->get('column.rating');

    assert($column instanceof DiscoveredComponent);

    expect($column->category)->toBe('column')
        ->and($column->class)->toBe(SampleColumn::class);
});

it('splits #[TypeScript]-marked classes into enums and value objects', function (): void {
    $manifest = new WireTypeDiscovery()->discover(dirname(__DIR__, 3).'/src');

    expect($manifest->enums)->toContain(Align::class)->toContain(Variant::class);
    expect($manifest->enums)->not->toContain(Option::class);

    expect($manifest->valueObjects)->toContain(Option::class)->toContain(ToastMessage::class);
    expect($manifest->valueObjects)->not->toContain(Align::class);
});

it('excludes classes without the #[TypeScript] attribute from enum/value-object discovery', function (): void {
    $manifest = new WireTypeDiscovery()->discover(dirname(__DIR__, 3).'/src');

    $all = [...$manifest->enums, ...$manifest->valueObjects];

    expect($all)->not->toContain(Card::class);
});

it('sorts enums and value objects deterministically by class-string', function (): void {
    $manifest = new WireTypeDiscovery()->discover(dirname(__DIR__, 3).'/src');

    $sortedEnums = $manifest->enums;
    sort($sortedEnums);
    $sortedValueObjects = $manifest->valueObjects;
    sort($sortedValueObjects);

    expect($manifest->enums)->toBe($sortedEnums)
        ->and($manifest->valueObjects)->toBe($sortedValueObjects);
});

it('keys effects by class-string, valued by wire type, sorted by class-string', function (): void {
    $manifest = new WireTypeDiscovery()->discover(dirname(__DIR__, 3).'/src');

    expect($manifest->effects[ToastEffect::class])->toBe('toast');

    $classes = array_keys($manifest->effects);
    $sorted = $classes;
    sort($sorted);

    expect($classes)->toBe($sorted);
});

it('does not classify an effect as a value object', function (): void {
    $manifest = new WireTypeDiscovery()->discover(dirname(__DIR__, 3).'/src');

    expect($manifest->valueObjects)->not->toContain(ToastEffect::class)
        ->and($manifest->enums)->not->toContain(ToastEffect::class);
});

it('classifies AsRemoteComponent with correct precedence in components', function (): void {
    $manifest = new WireTypeDiscovery()->discover(dirname(__DIR__, 3).'/src');

    $dataList = collect($manifest->components)->firstWhere('class', DataList::class);

    assert($dataList instanceof DiscoveredComponent);

    expect($dataList->type)->toBe('remote.data-list')
        ->and($dataList->category)->toBe('component')
        ->and($manifest->valueObjects)->not->toContain(DataList::class);
});

it('resolves a domain for every discovered src component', function (): void {
    $components = new WireTypeDiscovery()->discover(dirname(__DIR__, 3).'/src')->components;

    $orphans = collect($components)
        ->filter(fn (DiscoveredComponent $dc): bool => $dc->category === 'component' && $dc->domain === '')
        ->map(fn (DiscoveredComponent $dc): string => $dc->class);

    expect($orphans->all())->toBe([]);
});
