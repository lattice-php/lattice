<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Lattice\Lattice\Actions\Components\Action;
use Lattice\Lattice\Core\Enums\ButtonVariant;
use Lattice\Lattice\Core\Enums\Op;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Forms\Components\Textarea;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Support\Testing\Assertions\ActionAssertions;
use Lattice\Lattice\Support\Testing\Assertions\FieldAssertions;
use Lattice\Lattice\Support\Testing\Assertions\FilterAssertions;
use Lattice\Lattice\Support\Testing\Assertions\FormAssertions;
use Lattice\Lattice\Support\Testing\Assertions\TableAssertions;
use Lattice\Lattice\Support\Testing\AssertsLatticeComponents;
use Lattice\Lattice\Tables\Columns\TextColumn;
use Lattice\Lattice\Tables\Components\Table;
use Lattice\Lattice\Tables\Enums\FilterType;
use Lattice\Lattice\Tables\TableQuery;
use Lattice\Lattice\Tables\TableResult;
use PHPUnit\Framework\AssertionFailedError;

uses(AssertsLatticeComponents::class);

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

it('asserts against a rendered Inertia page', function (): void {
    Route::get('lattice-demo-page', fn () => Inertia::render('lattice/page', [
        'lattice' => [
            'schema' => json_decode(json_encode([
                Form::make('create')->action('/products')->schema([
                    TextInput::make('email')->value('a@b.c'),
                ]),
                Table::make('products')
                    ->columns([TextColumn::make('name')->filterable()])
                    ->result(TableResult::make([]), TableQuery::empty()),
            ], JSON_THROW_ON_ERROR), true),
        ],
    ]))->middleware('web');

    $this->assertLatticePage($this->get('lattice-demo-page'))
        ->assertRendered('form:create')
        ->assertRendered('table:products')
        ->table('products', fn (TableAssertions $t) => $t->assertHasFilter('name'))
        ->form('create', fn (FormAssertions $f) => $f
            ->field('email')->assertInitialValue('a@b.c'));
});
