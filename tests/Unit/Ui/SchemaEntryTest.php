<?php

declare(strict_types=1);

use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Forms\Components\Repeater;
use Lattice\Lattice\Forms\Components\RowTemplate;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Tables\Columns\StackColumn;
use Lattice\Lattice\Ui\Components\Component;
use Lattice\Lattice\Ui\Components\Stack;
use Lattice\Lattice\Ui\Components\Text;
use Lattice\Lattice\Ui\Contracts\SchemaEntry;

final class SchemaEntryStub implements SchemaEntry
{
    public int $resolutions = 0;

    /**
     * @param  array<int, Component>  $components
     */
    public function __construct(private readonly array $components) {}

    /**
     * @return array<int, Component>
     */
    public function resolveComponents(): array
    {
        $this->resolutions++;

        return $this->components;
    }
}

it('resolves page schema entries in declaration order before filtering visibility', function (): void {
    $first = Text::make('First');
    $second = Text::make('Second');
    $hidden = Text::make('Hidden')->hidden();
    $last = Text::make('Last');
    $entry = new SchemaEntryStub([$second, $hidden]);

    $renderable = PageSchema::make()
        ->schema([$first, $entry, $last])
        ->renderable();

    expect($renderable)->toBe([$first, $second, $last])
        ->and($entry->resolutions)->toBe(1);
});

it('exposes resolved entries to specialized child readers', function (): void {
    $repeaterField = TextInput::make('email');
    $templateField = TextInput::make('title');
    $shown = Text::make('')->dataKey('text', 'name');
    $hidden = Text::make('')->dataKey('text', 'secret')->hidden();

    $repeater = Repeater::make('contacts')->schema([
        new SchemaEntryStub([$repeaterField]),
    ]);
    $template = RowTemplate::make('contact')->schema([
        new SchemaEntryStub([$templateField]),
    ]);
    $column = StackColumn::make('identity')->schema([
        new SchemaEntryStub([$shown, $hidden]),
    ]);

    expect($repeater->childFields())->toBe([$repeaterField])
        ->and($template->fields())->toBe([$templateField])
        ->and($column->children())->toBe([$shown, $hidden])
        ->and($column->boundRowKeys())->toBe(['name']);
});

it('resolves container schema entries once for serialization and traversal', function (): void {
    $content = Text::make('Content', 'content');
    $nested = Stack::make('nested')->schema([$content]);
    $entry = new SchemaEntryStub([$nested]);

    $container = Stack::make('outer')->schema([$entry]);
    $serialized = wire($container);

    expect($serialized['schema'][0]['key'])->toBe('nested')
        ->and($container->descendants())->toBe([$nested, $content])
        ->and($entry->resolutions)->toBe(1);
});
