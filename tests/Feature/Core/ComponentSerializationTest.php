<?php

declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Form\Components\Form;
use Lattice\Http\Page;
use Lattice\Table\Components\Table;
use Lattice\Ui\Components\Stack;
use Lattice\Ui\Components\Tab;
use Lattice\Ui\Components\Tabs;
use Lattice\Ui\Components\Text;
use Lattice\Ui\Contracts\SchemaEntry;
use Lattice\Ui\PageSchema;

test('interactive components seal request context for endpoints', function (): void {
    $form = wire(Form::make('demo-form')
        ->action('/lattice/forms/demo-form')
        ->context(['team' => 'lattice-core']));
    $table = wire(Table::make('demo-table')
        ->endpoint('/lattice/tables/demo-table')
        ->context(['team' => 'lattice-core']));

    expect($form)
        ->toMatchArray([
            'type' => 'form',
            'id' => 'demo-form',
        ])
        ->and($form['props'])->toHaveKey('ref')
        ->and($form['props'])->not->toHaveKey('context')
        ->and($table)
        ->toMatchArray([
            'type' => 'table',
            'id' => 'demo-table',
        ])
        ->and($table['props'])->toHaveKey('ref')
        ->and($table['props'])->not->toHaveKey('context');
});

test('components can opt out of rendering with hidden', function (): void {
    $page = new class extends Page
    {
        public function render(PageSchema $schema): PageSchema
        {
            return $schema->schema([
                Text::make('Visible root'),
                Text::make('Hidden root')->hidden(),
                Stack::make('nested')->schema([
                    Text::make('Visible child'),
                    Text::make('Hidden child')->hidden(),
                ]),
            ]);
        }
    };

    $pageData = wire($page->toArray($page->render(PageSchema::make()), new Request));

    expect($pageData['schema'])
        ->toHaveCount(2)
        ->and($pageData['schema'][0]['props']['text'])->toBe('Visible root')
        ->and($pageData['schema'][1]['schema'])->toHaveCount(1)
        ->and($pageData['schema'][1]['schema'][0]['props']['text'])->toBe('Visible child');
});

test('tabs ignore hidden tab children when resolving their active value', function (): void {
    $tabs = wire(Tabs::make('settings-tabs')
        ->defaultValue('security')
        ->schema([
            Tab::make('profile', 'Profile'),
            Tab::make('security', 'Security')->hidden(),
        ]));

    expect($tabs['props']['activeValue'])->toBe('profile')
        ->and($tabs['schema'])->toHaveCount(1)
        ->and($tabs['schema'][0]['props']['value'])->toBe('profile');
});

test('tabs resolve schema entries once before inspecting their children', function (): void {
    $entry = new class implements SchemaEntry
    {
        public int $resolutions = 0;

        public function resolveComponents(): array
        {
            $this->resolutions++;

            return [
                Tab::make('profile', 'Profile'),
                Tab::make('security', 'Security'),
            ];
        }
    };

    $tabs = wire(Tabs::make('settings-tabs')
        ->defaultValue('security')
        ->schema([$entry]));

    expect($tabs['props']['activeValue'])->toBe('security')
        ->and(array_column(array_column($tabs['schema'], 'props'), 'value'))->toBe(['profile', 'security'])
        ->and($entry->resolutions)->toBe(1);
});
