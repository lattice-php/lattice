<?php

declare(strict_types=1);

use Bambamboole\Lattice\Components\Badge;
use Bambamboole\Lattice\Components\Form;
use Bambamboole\Lattice\Components\Link;
use Bambamboole\Lattice\Components\Stack;
use Bambamboole\Lattice\Components\Tab;
use Bambamboole\Lattice\Components\Table;
use Bambamboole\Lattice\Components\Tabs;
use Bambamboole\Lattice\Components\Text;
use Bambamboole\Lattice\Enums\Align;
use Bambamboole\Lattice\Enums\Gap;
use Bambamboole\Lattice\Enums\Width;
use Illuminate\Support\Facades\Route;
use Inertia\Testing\AssertableInertia;
use Workbench\App\Pages\WorkbenchHomePage;

use function Pest\Laravel\get;
use function Pest\Laravel\withoutVite;

test('lattice component factories stay open for extension', function () {
    $badgeClass = (new class extends Badge {})::class;
    $badge = $badgeClass::make('Extended badge', 'extended-badge');

    expect($badge)->toBeInstanceOf($badgeClass)
        ->and((new ReflectionClass(Badge::class))->isFinal())->toBeFalse();
});

test('interactive components keep their serialized ids', function () {
    expect(Form::make('demo-form')->toArray())
        ->toMatchArray([
            'type' => 'form',
            'id' => 'demo-form',
        ])
        ->and(Table::make('demo-table')->toArray())
        ->toMatchArray([
            'type' => 'table',
            'id' => 'demo-table',
        ]);
});

test('forms serialize schema children like pages', function () {
    expect(Form::make('profile-form')->schema([
        Text::make('Profile details'),
    ])->toArray())
        ->toMatchArray([
            'type' => 'form',
            'id' => 'profile-form',
            'children' => [
                [
                    'type' => 'text',
                    'props' => [
                        'text' => 'Profile details',
                    ],
                ],
            ],
        ]);
});

test('forms can disable their default submit button', function () {
    expect(Form::make('profile-form')->withoutSubmitButton()->toArray())
        ->toMatchArray([
            'type' => 'form',
            'id' => 'profile-form',
            'props' => [
                'submitButton' => false,
            ],
        ]);
});

test('links and horizontal stacks serialize as separate composable primitives', function () {
    expect(Stack::make('prompt')->direction('row')->gap(Gap::ExtraSmall)->children([
        Text::make('Need access?'),
        Link::make('Register')->href('/register'),
    ])->toArray())
        ->toMatchArray([
            'type' => 'stack',
            'key' => 'prompt',
            'props' => [
                'direction' => 'row',
                'gap' => 'xs',
            ],
            'children' => [
                [
                    'type' => 'text',
                    'props' => [
                        'text' => 'Need access?',
                    ],
                ],
                [
                    'type' => 'link',
                    'props' => [
                        'href' => '/register',
                        'label' => 'Register',
                    ],
                ],
            ],
        ]);
});

test('layout enums serialize to their backed string values', function () {
    expect(Stack::make('layout')
        ->align(Align::Center)
        ->gap(Gap::Large)
        ->width(Width::Small)
        ->toArray())
        ->toMatchArray([
            'props' => [
                'align' => 'center',
                'gap' => 'lg',
                'width' => 'sm',
            ],
        ])
        ->and(Text::make('Centered')->align(Align::Center)->toArray()['props']['align'])
        ->toBe('center');
});

test('tabs serialize tab panels as composable children', function () {
    expect(Tabs::make('settings-tabs')
        ->defaultValue('security')
        ->children([
            Tab::make('profile', 'Profile')->children([
                Text::make('Profile form'),
            ]),
            Tab::make('security', 'Security')->children([
                Form::make('password-form'),
            ]),
        ])
        ->toArray())
        ->toMatchArray([
            'type' => 'tabs',
            'key' => 'settings-tabs',
            'props' => [
                'defaultValue' => 'security',
            ],
            'children' => [
                [
                    'type' => 'tab',
                    'props' => [
                        'label' => 'Profile',
                        'value' => 'profile',
                    ],
                    'children' => [
                        [
                            'type' => 'text',
                            'props' => [
                                'text' => 'Profile form',
                            ],
                        ],
                    ],
                ],
                [
                    'type' => 'tab',
                    'props' => [
                        'label' => 'Security',
                        'value' => 'security',
                    ],
                    'children' => [
                        [
                            'type' => 'form',
                            'id' => 'password-form',
                        ],
                    ],
                ],
            ],
        ]);
});

test('the workbench home route uses a workbench-owned page directly', function () {
    expect(Route::getRoutes()->getByName('home')?->getActionName())->toBe(WorkbenchHomePage::class);
});

test('workbench pages serialize package component trees for inertia', function () {
    withoutVite();

    get('/')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('lattice/page')
            ->where('lattice.title', 'Lattice Workbench')
            ->where('lattice.components.0.type', 'stack')
            ->where('lattice.components.0.key', 'workbench-page')
            ->where('lattice.components.0.children.0.type', 'stack')
            ->where('lattice.components.0.children.0.key', 'workbench-hero')
            ->where('lattice.components.0.children.0.children.0.type', 'badge')
            ->where('lattice.components.0.children.0.children.0.props.label', 'Lattice Package')
            ->where('lattice.components.0.children.0.children.1.type', 'heading')
            ->where('lattice.components.0.children.0.children.1.props.text', 'Workbench page')
            ->where('lattice.components.0.children.1.type', 'grid')
            ->where('lattice.components.0.children.1.children.0.type', 'card')
            ->where('lattice.components.0.children.1.children.0.props.title', 'Components'));
});
