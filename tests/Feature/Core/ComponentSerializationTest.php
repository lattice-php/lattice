<?php

declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Http\Page;
use Lattice\Lattice\LatticeRegistry;
use Lattice\Lattice\Tables\Components\Table;
use Lattice\Lattice\Ui\Components\Modal;
use Lattice\Lattice\Ui\Components\Stack;
use Lattice\Lattice\Ui\Components\Tab;
use Lattice\Lattice\Ui\Components\Tabs;
use Lattice\Lattice\Ui\Components\Text;
use Lattice\Lattice\Ui\Contracts\SchemaEntry;

test('lattice facade resolves the registry', function (): void {
    expect(Lattice::getFacadeRoot())->toBe(app(LatticeRegistry::class));
});

test('interactive components keep their serialized ids', function (): void {
    expect(wire(Form::make('demo-form')))
        ->toMatchArray([
            'type' => 'form',
            'id' => 'demo-form',
        ])
        ->and(wire(Table::make('demo-table')))
        ->toMatchArray([
            'type' => 'table',
            'id' => 'demo-table',
        ]);
});

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

test('modals serialize composable children for action driven dialogs', function (): void {
    expect(wire(Modal::make('settings.two-factor-setup')
        ->title('Set up two-factor authentication')
        ->description('Scan the QR code with your authenticator app.')
        ->schema([
            Text::make('Recovery codes will appear here.'),
        ])))
        ->toMatchArray([
            'type' => 'modal',
            'id' => 'settings.two-factor-setup',
            'props' => [
                'title' => 'Set up two-factor authentication',
                'description' => 'Scan the QR code with your authenticator app.',
                'closeLabel' => 'Close',
                'open' => false,
                'side' => null,
                'width' => 'lg',
                'ref' => null,
            ],
            'schema' => [
                [
                    'type' => 'text',
                    'props' => [
                        'text' => 'Recovery codes will appear here.',
                        'align' => null,
                        'size' => 'md',
                        'color' => null,
                        'copyable' => false,
                    ],
                ],
            ],
        ]);
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
