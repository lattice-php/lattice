---
title: Testing
description: Assert against the components a Lattice page renders — forms, fields, tables, filters, and actions — with the AssertsLatticeComponents trait.
---

Lattice ships a testing trait, `AssertsLatticeComponents`, that lets you make readable
assertions about the components your pages render: which forms, tables, and actions are
visible, whether a field is shown or hidden, what initial value it carries, and which
filters a table exposes. It asserts against the serialized wire tree — the exact payload
that reaches the browser — so a passing test reflects what a user with the current request
and authorization actually sees.

It is inspired by Filament's test helpers, adapted to Lattice's stateless Inertia output.

## Setup

The trait adds methods to your test case. Apply it once in your base `TestCase`:

```php
use Lattice\Lattice\Support\Testing\AssertsLatticeComponents;

abstract class TestCase extends \Tests\TestCase
{
    use AssertsLatticeComponents;
}
```

…or per file in Pest:

```php
uses(Lattice\Lattice\Support\Testing\AssertsLatticeComponents::class);
```

## Entry points

They produce the same fluent assertions; pick the one that fits the test.

**Against a component you build in the test** — fast, no HTTP:

```php
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Forms\Components\TextInput;

$form = Form::make('product')->action('/products')->schema([
    TextInput::make('name', 'Name'),
]);

$this->assertLatticeComponent($form)
    ->assertHasForm('product');
```

**Against a rendered page** — reads the component tree from the Inertia response:

```php
$this->assertLatticePage($this->get('/products'))
    ->assertRendered('table:products');
```

**Against a page's layout shell** — the sidebar, topbar, and other chrome around the page:

```php
$this->assertLatticeLayout($this->get('/'))
    ->assertRendered('topbar')
    ->assertRendered('menu-item:settings');
```

> Page tests render a real Inertia view. If your front-end assets aren't built in the test
> environment, call `withoutVite()` first (`use function Pest\Laravel\withoutVite;`).

## Navigating the tree

From the root you navigate to a component, then assert on it. Pass a closure to scope a
group of assertions and keep chaining from the root; omit it to get the node back directly.

```php
use Lattice\Lattice\Support\Testing\Assertions\FormAssertions;
use Lattice\Lattice\Support\Testing\Assertions\FieldAssertions;

$this->assertLatticeComponent($form)
    ->form('product', fn (FormAssertions $form) => $form
        ->assertSubmitsTo('/products')
        ->field('name', fn (FieldAssertions $field) => $field
            ->assertVisible()
            ->assertInitialValue('Desk Lamp')));
```

`form(?id)`, `table(?id)`, and `action(id)` find a component by type (and optional id). When
the id is omitted, the first component of that type is used. `component(type, ?id, ?tap)` does
the same for any component type; `assertProp(key, value)` and `assertProps([...])` then assert
the scoped node's props:

```php
$this->assertLatticeLayout($this->get('/'))
    ->component('topbar', tap: fn ($topbar) => $topbar->assertProp('sticky', true))
    ->component('menu-item', 'settings', fn ($item) => $item->assertProp('icon', 'settings'));
```

The `id` segment matches a component's interactive `id` **or** its author-supplied `key`, so
layout and container components (`topbar`, `menu-item:settings`, `dropdown:user-menu`, …) are
addressable the same way.

Anywhere a `type` is accepted you may pass the component class instead of its wire string — it
resolves to the declared type, so a rename or typo is caught by the compiler:

```php
use Lattice\Lattice\Layouts\Components\MenuItem;
use Lattice\Lattice\Layouts\Components\Topbar;

$this->assertLatticeLayout($this->get('/'))
    ->component(Topbar::class, tap: fn ($topbar) => $topbar->assertProp('sticky', true))
    ->component(MenuItem::class, 'settings', fn ($item) => $item->assertProp('icon', 'settings'));
```

`assertProp()` keys may be dot-notated to reach into nested prop data — handy for form state or
table columns without walking the tree by index:

```php
$this->assertLatticePage($this->get('/products/1/edit'))
    ->component('form', 'products.form', fn ($form) => $form->assertProps([
        'method' => 'patch',
        'state.name' => 'Desk Lamp',
        'state.sales_prices.0.amount' => '49.99',
    ]));
```

## Asserting what is rendered

A component is "rendered" when it survives `shouldRender()` and `authorize()` and appears in
the tree. Use selectors of the form `type` or `type:id`:

```php
$this->assertLatticePage($this->get('/products'))
    ->assertRendered('table:products')
    ->assertRendered('action:create')
    ->assertNotRendered('action:archive')   // hidden for this user
    ->assertRenderedCount('action', 1);
```

This is the natural way to test authorization-driven visibility: gate an action behind a
policy, act as a user who fails it, and assert `assertNotRendered('action:…')`.

## Forms and fields

```php
$this->assertLatticeComponent($form)
    ->form('product', fn (FormAssertions $form) => $form
        ->assertSubmitsTo('/products')
        ->assertHasField('name')
        ->assertMissingField('secret')
        ->field('name', fn (FieldAssertions $field) => $field
            ->assertVisible()
            ->assertRequired()
            ->assertInitialValue('Desk Lamp')));
```

Field assertions: `assertVisible` / `assertHidden`, `assertVisibleWhen($state)` /
`assertHiddenWhen($state)`, `assertRequired` / `assertOptional`, `assertDisabled` /
`assertEnabled`, `assertReadOnly`, `assertInitialValue($value)`, and
`assertHasCondition($type, $field, $operator, $value)`.

`assertVisible` / `assertHidden` check whether a field is force-hidden via `->hidden()`. A
field shown only by a condition (`->visibleWhen(...)`) is not statically hidden, so it passes
`assertVisible`. To evaluate conditional visibility for a given form state, use
`assertVisibleWhen` / `assertHiddenWhen`, which run the field's conditions against the state
you pass:

```php
use Lattice\Lattice\Core\Enums\Op;

$field = TextInput::make('sku')->visibleWhen('type', 'physical');

$this->assertLatticeComponent($form)
    ->form('product', fn (FormAssertions $form) => $form
        ->field('sku', fn (FieldAssertions $field) => $field
            ->assertVisibleWhen(['type' => 'physical'])
            ->assertHiddenWhen(['type' => 'digital'])
            ->assertHasCondition('visible', 'type', Op::Equals, 'physical')));
```

`assertInitialValue` resolves the value the field is seeded with: a `->fill()`ed form's state
wins, otherwise the field's own `->value()` — matching the bound-edit runtime precedence.

## Tables and filters

```php
use Lattice\Lattice\Core\Enums\Op;
use Lattice\Lattice\Tables\Enums\FilterType;
use Lattice\Lattice\Support\Testing\Assertions\TableAssertions;
use Lattice\Lattice\Support\Testing\Assertions\FilterAssertions;

$this->assertLatticePage($this->get('/products'))
    ->table('products', fn (TableAssertions $table) => $table
        ->assertHasColumn('name')
        ->assertHasFilter('name')
        ->assertMissingFilter('internal_notes')
        ->assertHasBulkAction('archive')
        ->filter('name', fn (FilterAssertions $filter) => $filter
            ->assertType(FilterType::Text)
            ->assertDefaultOperator(Op::Contains)
            ->assertOperators([Op::Contains, Op::Equals])));
```

## Actions

```php
use Lattice\Lattice\Core\Enums\ButtonVariant;
use Lattice\Lattice\Support\Testing\Assertions\ActionAssertions;

$this->assertLatticeComponent($action)
    ->action('archive', fn (ActionAssertions $action) => $action
        ->assertLabel('Archive')
        ->assertEndpoint('/lattice/actions/archive')
        ->assertVariant(ButtonVariant::Destructive)
        ->assertHasConfirmation()
        ->assertConfirmationTitle('Archive product?')
        ->assertHasForm());
```

## Test selectors

Lattice uses `data-test` as its standard test-hook attribute. `data-testid` is **not** used.

**Pest browser tests** target `data-test` via the `@shorthand` selector. `->click('@foo')` is
equivalent to clicking `[data-test="foo"]`.

**Vitest + Testing Library unit tests** query it via `getByTestId`, `queryByTestId`, and friends.
The resolver is pointed at `data-test` by the `configure({ testIdAttribute: "data-test" })` call
in `resources/js/test/setup.ts`, so no test-by-test configuration is needed.

## Helpful failures

Every assertion fails with context. A missing field lists the available fields; an
unrendered selector lists what was rendered; a missing filter lists the table's filters —
so you spend less time printing the payload to find a typo.

```
Lattice form field [emial] not found at [page › form#product].
Available fields: [name, sku, price].
```
