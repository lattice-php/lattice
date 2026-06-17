<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Lattice\Lattice\Actions\Components\Action;
use Lattice\Lattice\Core\Components\Stack;
use Lattice\Lattice\Core\Enums\ButtonVariant;
use Lattice\Lattice\Core\Enums\Op;
use Lattice\Lattice\Core\Enums\Side;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Forms\Components\Textarea;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Layouts\Components\Menu;
use Lattice\Lattice\Layouts\Components\MenuItem;
use Lattice\Lattice\Layouts\Components\Topbar;
use Lattice\Lattice\Support\Testing\Assertions\ActionAssertions;
use Lattice\Lattice\Support\Testing\Assertions\FieldAssertions;
use Lattice\Lattice\Support\Testing\Assertions\FilterAssertions;
use Lattice\Lattice\Support\Testing\Assertions\FormAssertions;
use Lattice\Lattice\Support\Testing\Assertions\TableAssertions;
use Lattice\Lattice\Tables\Columns\TextColumn;
use Lattice\Lattice\Tables\Components\Table;
use Lattice\Lattice\Tables\Enums\FilterType;
use Lattice\Lattice\Tables\TableQuery;
use Lattice\Lattice\Tables\TableResult;
use PHPUnit\Framework\AssertionFailedError;

use function Pest\Laravel\withoutVite;

it('navigates a built form and asserts page rendering by visibility', function (): void {
    $form = Form::make('create')->action('/products')->schema([
        TextInput::make('email')->label('Email'),
    ]);

    $this->assertLatticeComponent($form)
        ->assertRendered('form:create')
        ->assertNotRendered('form:missing')
        ->assertRenderedCount('form', 1)
        ->assertHasForm('create');
});

it('fails with a helpful message when a selector is not rendered', function (): void {
    $form = Form::make('create')->schema([]);

    expect(fn () => $this->assertLatticeComponent($form)->assertRendered('table:products'))
        ->toThrow(AssertionFailedError::class, 'table:products');
});

it('asserts field visibility, conditions and initial value', function (): void {
    $form = Form::make('create')
        ->action('/products')
        ->fill(['email' => 'a@b.c'])
        ->schema([
            TextInput::make('email')->label('Email'),
            TextInput::make('company')->visibleWhen('type', 'business'),
            TextInput::make('secret')->hidden(),
        ]);

    $this->assertLatticeComponent($form)
        ->form('create', fn (FormAssertions $form) => $form
            ->assertSubmitsTo('/products')
            ->assertHasField('email')
            ->assertMissingField('nope')
            ->field('email', fn (FieldAssertions $f) => $f
                ->assertVisible()
                ->assertInitialValue('a@b.c'))
            ->field('company', fn (FieldAssertions $f) => $f
                ->assertVisibleWhen(['type' => 'business'])
                ->assertHiddenWhen(['type' => 'personal'])
                ->assertHasCondition('visible', 'type', Op::Equals, 'business'))
            ->field('secret', fn (FieldAssertions $f) => $f->assertHidden()));
});

it('asserts table filters, columns and operators', function (): void {
    $table = Table::make('products')
        ->endpoint('/tables/products')
        ->columns([
            TextColumn::make('name')->label('Name')->filterable(),
            TextColumn::make('price')->label('Price'),
        ])
        ->result(TableResult::make([]), TableQuery::empty());

    $this->assertLatticeComponent($table)
        ->table('products', fn (TableAssertions $table) => $table
            ->assertHasColumn('name')
            ->assertHasFilter('name')
            ->assertMissingFilter('price')
            ->filter('name', fn (FilterAssertions $f) => $f
                ->assertType(FilterType::Text)
                ->assertDefaultOperator(Op::Contains)
                ->assertOperators([
                    Op::Contains, Op::StartsWith, Op::EndsWith,
                    Op::Equals, Op::NotEquals, Op::Empty, Op::Filled,
                ])));
});

it('asserts action state', function (): void {
    $action = Action::make('archive')
        ->endpoint('/lattice/actions/archive')
        ->label('Archive')
        ->variant(ButtonVariant::Destructive)
        ->confirm('Archive product?', 'This hides the product.')
        ->form([Textarea::make('reason')->label('Reason')]);

    $this->assertLatticeComponent($action)
        ->action('archive', fn (ActionAssertions $a) => $a
            ->assertLabel('Archive')
            ->assertEndpoint('/lattice/actions/archive')
            ->assertVariant(ButtonVariant::Destructive)
            ->assertHasConfirmation()
            ->assertConfirmationTitle('Archive product?')
            ->assertHasForm());
});

it('asserts field required, optional, disabled, enabled and read-only flags', function (): void {
    $form = Form::make('flags')->schema([
        TextInput::make('plain')->label('Plain'),
        TextInput::make('req')->required(),
        TextInput::make('ro')->readOnly(),
        TextInput::make('dis')->disabled(),
    ]);

    $this->assertLatticeComponent($form)
        ->form('flags', fn (FormAssertions $f) => $f
            ->field('plain', fn (FieldAssertions $x) => $x->assertOptional()->assertEnabled())
            ->field('req', fn (FieldAssertions $x) => $x->assertRequired())
            ->field('ro', fn (FieldAssertions $x) => $x->assertReadOnly())
            ->field('dis', fn (FieldAssertions $x) => $x->assertDisabled()));
});

it('asserts table presence and bulk actions', function (): void {
    $table = Table::make('orders')
        ->columns([TextColumn::make('ref')->label('Ref')])
        ->bulkActions([Action::make('archive')->label('Archive')])
        ->result(TableResult::make([]), TableQuery::empty());

    $this->assertLatticeComponent($table)
        ->assertHasTable('orders')
        ->table('orders', fn (TableAssertions $t) => $t->assertHasBulkAction('archive'));
});

it('asserts against a rendered Inertia page', function (): void {
    withoutVite();

    Route::get('lattice-demo-page', fn () => Inertia::render('lattice/page', [
        'lattice' => [
            'schema' => wire([
                Form::make('create')->action('/products')->schema([
                    TextInput::make('email')->value('a@b.c'),
                ]),
                Table::make('products')
                    ->columns([TextColumn::make('name')->filterable()])
                    ->result(TableResult::make([]), TableQuery::empty()),
            ]),
        ],
    ]))->middleware('web');

    $this->assertLatticePage($this->get('lattice-demo-page'))
        ->assertRendered('form:create')
        ->assertRendered('table:products')
        ->table('products', fn (TableAssertions $t) => $t->assertHasFilter('name'))
        ->form('create', fn (FormAssertions $f) => $f
            ->field('email')->assertInitialValue('a@b.c'));
});

it('addresses layout components by key and asserts their props', function (): void {
    $topbar = Topbar::make('app-topbar')->sticky()->items([
        Stack::make('end')->direction('row')->float(Side::End)->schema([
            Menu::make('nav')->items([
                MenuItem::make('Settings', 'settings')->icon('settings')->href('/settings'),
            ]),
        ]),
    ]);

    $this->assertLatticeComponent($topbar)
        ->assertRendered('topbar:app-topbar')
        ->assertRendered('menu-item:settings')
        ->assertNotRendered('menu-item:missing')
        ->component('topbar', 'app-topbar', fn ($bar) => $bar->assertProp('sticky', true))
        ->component('menu-item', 'settings', fn ($item) => $item
            ->assertProps(['icon' => 'settings', 'href' => '/settings', 'label' => 'Settings']));
});

it('asserts against a rendered layout tree', function (): void {
    withoutVite();

    Route::get('lattice-layout-demo', fn () => Inertia::render('lattice/page', [
        'lattice' => [
            'layout' => [
                'key' => 'app',
                'schema' => wire([
                    Topbar::make('app-topbar')->sticky()->items([
                        Menu::make('nav')->items([
                            MenuItem::make('Home', 'home')->href('/'),
                        ]),
                    ]),
                ]),
            ],
            'schema' => wire([]),
        ],
    ]))->middleware('web');

    $this->assertLatticeLayout($this->get('lattice-layout-demo'))
        ->assertRendered('menu-item:home')
        ->component('topbar', 'app-topbar', fn ($bar) => $bar->assertProp('sticky', true));
});
