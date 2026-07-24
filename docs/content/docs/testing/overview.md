---
title: Testing
description: Why testing matters for a server-driven UI, and the Lattice traits for asserting what a page renders and exercising its endpoints.
---

Testing matters more, not less, for a server-driven UI. Your interface is described in PHP
and serialized to the browser, so a test can assert against the _exact_ payload a user
receives — what renders, what is hidden, what a field is seeded with — without a browser or
a duplicated UI contract. Correctness becomes cheap to pin down, so treat tests as a
first-class part of building with Lattice, not an afterthought.

Lattice holds itself to the same bar: the package is covered by an extensive Pest and Vitest
suite, and it ships — and dogfoods — the very helpers documented here.

[![Pest coverage](https://img.shields.io/codecov/c/github/lattice-php/lattice/main?flag=pest&label=pest&style=flat-square)](https://app.codecov.io/gh/lattice-php/lattice) [![Vitest coverage](https://img.shields.io/codecov/c/github/lattice-php/lattice/main?flag=vitest&label=vitest&style=flat-square)](https://app.codecov.io/gh/lattice-php/lattice)

Two traits cover the ground. `AssertsLatticeComponents` makes readable assertions about the
components your pages render — which forms, tables, and actions are visible, whether a field
is shown or hidden, what value it carries, which filters a table exposes — all against the
serialized wire tree, the exact payload that reaches the browser. `InteractsWithLatticeComponents`
adds the other half: it submits to a component's own endpoint with a signed ref sealed from the
class and context, so you can exercise forms, actions, tables, and fragments end to end. It
bundles `AssertsLatticeComponents`, so a single trait gives you both.

The assertion helpers are inspired by Filament's, adapted to Lattice's stateless Inertia output.

## Setup

Apply `InteractsWithLatticeComponents` once in your base `TestCase`. It bundles
`AssertsLatticeComponents`, so a single trait provides both the assertions and the endpoint
helpers:

```php
use Lattice\Lattice\Support\Testing\InteractsWithLatticeComponents;

abstract class TestCase extends \Tests\TestCase
{
    use InteractsWithLatticeComponents;
}
```

…or per file in Pest:

```php
uses(Lattice\Lattice\Support\Testing\InteractsWithLatticeComponents::class);
```

:::note
If you only assert against rendered components and never submit to an endpoint, the
`AssertsLatticeComponents` trait on its own is enough.
:::

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
            ->assertRequired()
            ->assertInitialValue('Desk Lamp')));
```

Field assertions: `assertVisibleWhen($state)` / `assertHiddenWhen($state)`,
`assertRequired` / `assertOptional`, `assertDisabled` / `assertEnabled`, `assertReadOnly`,
`assertInitialValue($value)`, and `assertHasCondition($type, $field, $operator, $value)`.

`assertVisibleWhen` / `assertHiddenWhen` run the field's conditions against the form state
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
use Lattice\Lattice\Ui\Enums\Variant;
use Lattice\Lattice\Support\Testing\Assertions\ActionAssertions;

$this->assertLatticeComponent($action)
    ->action('archive', fn (ActionAssertions $action) => $action
        ->assertLabel('Archive')
        ->assertEndpoint('/lattice/actions/archive')
        ->assertVariant(Variant::Danger)
        ->assertHasConfirmation()
        ->assertConfirmationTitle('Archive product?')
        ->assertHasForm());
```

## Submitting to a component endpoint

The assertions above check what a page _renders_. To exercise the other half — what happens
when a form is submitted, an action is invoked, or a table is queried — `InteractsWithLatticeComponents`
seals a signed ref from the component class and context and posts to the generic endpoint for
you. Each helper returns a `LatticeTestResponse`, a Laravel `TestResponse` subclass, so the
usual Laravel assertions remain available:

```php
$this->submitForm(ProductForm::class, ['name' => 'Desk Lamp'])
    ->assertRedirect('/products');

$this->callAction(ArchiveProduct::class, ['id' => 7], context: ['team' => $team])
    ->assertJsonPath('ok', true);

$this->callBulkAction(ArchiveProducts::class, ['selected' => [1, 2]], context: ['table' => 'products'])
    ->assertOk();

$this->loadTable(ProductsTable::class, ['filter' => ['name' => 'lamp'], 'page' => 2])
    ->assertJsonPath('data.0.name', 'Desk Lamp');

$this->loadFragment(SalesChart::class)
    ->assertOk();
```

Action responses also provide typed assertions for [effects](/actions/effects/), keeping tests
independent of wire discriminators and payload structure:

```php
use Lattice\Lattice\Ui\Enums\Variant;

$this->callAction(SaveProfile::class, ['name' => 'Taylor'])
    ->assertOk()
    ->assertToast(Variant::Success, 'Profile saved.')
    ->assertReloadsComponent('profile.passkeys');

$this->callAction(OpenSecuritySettings::class)
    ->assertOpensModal('two-factor')
    ->assertRedirectsToRoute('settings.security');

$this->callAction(RefreshDashboard::class)
    ->assertReloadsPage();

$this->callAction(NoopAction::class)
    ->assertNoEffects();
```

| Assertion                                     | Matches                                      |
| --------------------------------------------- | -------------------------------------------- |
| `assertReloadsComponent($component)`          | A component reload by id                     |
| `assertRedirectsTo($url)`                     | A redirect to an exact URL                   |
| `assertRedirectsToRoute($route, $parameters)` | A redirect to a named route                  |
| `assertToast($variant, $message)`             | A toast variant and, optionally, its message |
| `assertOpensModal($modal)`                    | A modal opened by key                        |
| `assertReloadsPage()`                         | A full-page reload                           |
| `assertNoEffects()`                           | An empty effect queue                        |

Effect assertions are fluent and do not depend on queue order. They match the relevant props
while allowing unrelated effect props, so `assertToast(Variant::Success)` checks only the
variant and `assertToast(Variant::Success, 'Saved.')` also checks the message. A failed assertion
prints the expected effect and every effect received in the response.

Each helper builds the component exactly as a render would — same class, same context — extracts
the signed ref, and issues the request with the component's declared HTTP method and the
`X-Lattice-Ref` header. The request payload is the second argument; context (the active team or
tenant, and the bound table slug for a bulk action) is the third.

:::caution
These helpers issue **JSON** requests, so a form whose validation fails returns a `422` JSON
response rather than the redirect-back-with-errors path of a non-JSON post. Assert with
`assertJsonValidationErrors()` (not `assertSessionHasErrors()`), and for multi-step flows that
reuse a single sealed ref, build the request by hand instead.
:::

## Test selectors

Lattice uses `data-test` as its standard test-hook attribute.

**Pest browser tests** target `data-test` via the `@shorthand` selector: `->click('@foo')` clicks
`[data-test="foo"]`.

**Vitest + Testing Library unit tests** query it via `getByTestId`, `queryByTestId`, and friends.
The resolver is pointed at `data-test` by the `configure({ testIdAttribute: "data-test" })` call
in `resources/js/test/setup.ts`, so no test-by-test configuration is needed.

## Helpful failures

Every assertion fails with context. A missing field lists the available fields; an
unrendered selector lists what was rendered; a missing filter lists the table's filters —
so you spend less time printing the payload to find a typo.

```
Lattice form field [emial] not found at [page › product].
Available fields: [name, sku, price].
```
