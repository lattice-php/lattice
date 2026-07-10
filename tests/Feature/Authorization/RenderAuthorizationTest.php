<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Route;
use Lattice\Lattice\Actions\ActionDefinition;
use Lattice\Lattice\Actions\ActionResult;
use Lattice\Lattice\Actions\BulkActionDefinition;
use Lattice\Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Lattice\Actions\Components\BulkAction as BulkActionComponent;
use Lattice\Lattice\Attributes\AsAction;
use Lattice\Lattice\Attributes\AsBulkAction;
use Lattice\Lattice\Attributes\AsForm;
use Lattice\Lattice\Attributes\AsFragment;
use Lattice\Lattice\Attributes\AsTable;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Core\Services\ComponentReferenceSigner;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Forms\Components\Form as FormComponent;
use Lattice\Lattice\Forms\FormDefinition;
use Lattice\Lattice\Fragments\Components\Fragment as FragmentComponent;
use Lattice\Lattice\Fragments\FragmentDefinition;
use Lattice\Lattice\Http\Page;
use Lattice\Lattice\Tables\CallbackTableSource;
use Lattice\Lattice\Tables\Columns\TextColumn;
use Lattice\Lattice\Tables\Components\Table as TableComponent;
use Lattice\Lattice\Tables\Contracts\TableSource;
use Lattice\Lattice\Tables\TableDefinition;
use Lattice\Lattice\Tables\TableQuery;
use Lattice\Lattice\Tables\TableResult;
use Lattice\Lattice\Ui\Components\Text;
use Symfony\Component\HttpFoundation\Response;

use function Pest\Laravel\get;
use function Pest\Laravel\patch;
use function Pest\Laravel\postJson;
use function Pest\Laravel\withoutVite;

beforeEach(function (): void {
    RenderAuthorizationTestAction::$authorized = true;
    RenderAuthorizationTestForm::$authorized = true;
    RenderAuthorizationTestFragment::$authorized = true;
    RenderAuthorizationTestTable::$authorized = true;
    RenderAuthorizationTestBulkAction::$authorized = true;

    Lattice::actions([RenderAuthorizationTestAction::class]);
    Lattice::forms([RenderAuthorizationTestForm::class]);
    Lattice::fragments([RenderAuthorizationTestFragment::class]);
    Lattice::tables([RenderAuthorizationTestTable::class]);
    Lattice::bulkActions([RenderAuthorizationTestBulkAction::class]);

    Route::get('render-authorization-test', [RenderAuthorizationTestPage::class, 'render'])
        ->middleware('web')
        ->name('render-authorization-test.show');

    withoutVite();
});

test('an unauthorized action is hidden from the page payload, leaves no trace on the wire, and the endpoint still 403s', function (): void {
    RenderAuthorizationTestAction::$authorized = false;

    $response = get('/render-authorization-test')->assertOk();

    $this->assertLatticePage($response)->assertNotRendered('action:render-auth.action');
    expect($response->getContent())->not->toContain('/lattice/actions/render-auth.action');

    $ref = app(ComponentReferenceSigner::class)->seal('action', 'render-auth.action', []);
    postJson('/lattice/actions/render-auth.action', [], ['X-Lattice-Ref' => $ref])
        ->assertForbidden();
});

test('an authorized action still renders on the page', function (): void {
    $response = get('/render-authorization-test')->assertOk();

    $this->assertLatticePage($response)->assertRendered('action:render-auth.action');
});

test('an unauthorized form is hidden from the page payload, and the endpoint still 403s', function (): void {
    RenderAuthorizationTestForm::$authorized = false;

    $response = get('/render-authorization-test')->assertOk();

    $this->assertLatticePage($response)->assertNotRendered('form:render-auth.form');
    expect($response->getContent())->not->toContain('/lattice/forms/render-auth.form');

    $ref = app(ComponentReferenceSigner::class)->seal('form', 'render-auth.form', []);
    patch('/lattice/forms/render-auth.form', [], ['X-Lattice-Ref' => $ref])
        ->assertForbidden();
});

test('an authorized form still renders on the page', function (): void {
    $response = get('/render-authorization-test')->assertOk();

    $this->assertLatticePage($response)->assertRendered('form:render-auth.form');
});

test('an unauthorized fragment is hidden from the page payload, and the endpoint still 403s', function (): void {
    RenderAuthorizationTestFragment::$authorized = false;

    $response = get('/render-authorization-test')->assertOk();

    $this->assertLatticePage($response)->assertNotRendered('fragment:render-auth.fragment');
    expect($response->getContent())->not->toContain('/lattice/fragments/render-auth.fragment');

    $ref = app(ComponentReferenceSigner::class)->seal('fragment', 'render-auth.fragment', []);
    latticeGet('/lattice/fragments/render-auth.fragment', $ref)
        ->assertForbidden();
});

test('an authorized fragment still renders on the page', function (): void {
    $response = get('/render-authorization-test')->assertOk();

    $this->assertLatticePage($response)->assertRendered('fragment:render-auth.fragment');
});

test('an unauthorized table is hidden from the page payload, leaves no trace on the wire, and the endpoint still 403s', function (): void {
    RenderAuthorizationTestTable::$authorized = false;

    $response = get('/render-authorization-test')->assertOk();

    $this->assertLatticePage($response)->assertNotRendered('table:render-auth.table');
    expect($response->getContent())
        ->not->toContain('/lattice/tables/render-auth.table')
        ->not->toContain('render-auth.bulk-action');

    $ref = app(ComponentReferenceSigner::class)->seal('table', 'render-auth.table', []);
    latticeGet('/lattice/tables/render-auth.table', $ref)
        ->assertForbidden();
});

test('an authorized table still renders on the page', function (): void {
    $response = get('/render-authorization-test')->assertOk();

    $this->assertLatticePage($response)->assertRendered('table:render-auth.table');
});

test('an unauthorized bulk action is pruned from the table bulkActions prop, and the endpoint still 403s', function (): void {
    RenderAuthorizationTestBulkAction::$authorized = false;

    $response = get('/render-authorization-test')->assertOk();

    $this->assertLatticePage($response)
        ->component('table', 'render-auth.table', fn ($table) => $table
            ->assertNotRendered('action.bulk:render-auth.bulk-action'));

    $ref = app(ComponentReferenceSigner::class)->seal(
        'action.bulk',
        'render-auth.bulk-action',
        ['table' => 'render-auth.table'],
    );
    patch('/lattice/bulk-actions/render-auth.bulk-action', [], ['X-Lattice-Ref' => $ref])
        ->assertForbidden();
});

test('an authorized bulk action still renders in the table bulkActions prop', function (): void {
    $response = get('/render-authorization-test')->assertOk();

    $this->assertLatticePage($response)
        ->component('table', 'render-auth.table', fn ($table) => $table
            ->assertRendered('action.bulk:render-auth.bulk-action'));
});

#[AsAction('render-auth.action')]
final class RenderAuthorizationTestAction extends ActionDefinition
{
    public static bool $authorized = true;

    public function definition(ActionComponent $action): ActionComponent
    {
        return $action->label('Denyable action');
    }

    public function handle(Request $request): ActionResult
    {
        return ActionResult::success();
    }

    #[Override]
    public function authorize(Request $request): bool
    {
        return self::$authorized;
    }
}

#[AsForm('render-auth.form')]
final class RenderAuthorizationTestForm extends FormDefinition
{
    public static bool $authorized = true;

    public function definition(FormComponent $form, Request $request): FormComponent
    {
        return $form;
    }

    public function handle(Request $request): Response
    {
        return new Response;
    }

    #[Override]
    public function authorize(Request $request): bool
    {
        return self::$authorized;
    }
}

#[AsFragment('render-auth.fragment')]
final class RenderAuthorizationTestFragment extends FragmentDefinition
{
    public static bool $authorized = true;

    public function schema(PageSchema $schema): PageSchema
    {
        return $schema->component(Text::make('Denyable fragment'));
    }

    #[Override]
    public function authorize(Request $request): bool
    {
        return self::$authorized;
    }
}

#[AsBulkAction('render-auth.bulk-action')]
final class RenderAuthorizationTestBulkAction extends BulkActionDefinition
{
    public static bool $authorized = true;

    public function definition(ActionComponent $action): ActionComponent
    {
        return $action->label('Denyable bulk action');
    }

    /**
     * @param  Collection<int, mixed>  $records
     */
    public function handle(Collection $records, Request $request): ActionResult
    {
        return ActionResult::success();
    }

    #[Override]
    public function authorize(Request $request): bool
    {
        return self::$authorized;
    }
}

#[AsTable('render-auth.table')]
final class RenderAuthorizationTestTable extends TableDefinition
{
    public static bool $authorized = true;

    public function columns(): array
    {
        return [TextColumn::make('name')];
    }

    public function source(): TableSource
    {
        return new CallbackTableSource(fn (TableQuery $query): TableResult => TableResult::make([]));
    }

    /**
     * @return array<int, ActionComponent>
     */
    #[Override]
    public function bulkActions(): array
    {
        return [BulkActionComponent::use(RenderAuthorizationTestBulkAction::class)];
    }

    #[Override]
    public function authorize(Request $request): bool
    {
        return self::$authorized;
    }
}

final class RenderAuthorizationTestPage extends Page
{
    public function render(PageSchema $schema): PageSchema
    {
        return $schema
            ->component(ActionComponent::use(RenderAuthorizationTestAction::class))
            ->component(FormComponent::use(RenderAuthorizationTestForm::class))
            ->component(FragmentComponent::lazy(RenderAuthorizationTestFragment::class))
            ->component(TableComponent::use(RenderAuthorizationTestTable::class));
    }
}
