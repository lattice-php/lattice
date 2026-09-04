<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Actions\ActionDefinition;
use Lattice\Actions\ActionResult;
use Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Core\Attributes\AsAction;
use Lattice\Core\Facades\Lattice;
use Lattice\Form\Attributes\AsForm;
use Lattice\Form\Components\Form as FormComponent;
use Lattice\Form\FormDefinition;
use Lattice\Table\Attributes\AsTable;
use Lattice\Table\CallbackTableSource;
use Lattice\Table\Columns\TextColumn;
use Lattice\Table\Components\Table;
use Lattice\Table\Contracts\TableSource;
use Lattice\Table\TableDefinition;
use Lattice\Table\TableQuery;
use Lattice\Table\TableResult;
use Lattice\Ui\Components\Button;
use Lattice\Ui\Components\Modal;
use Symfony\Component\HttpFoundation\Response;

use function Pest\Laravel\postJson;

beforeEach(function (): void {
    config()->set('lattice.context.inherited_keys', ['tenant']);
    RowCtxInheritanceAction::$seen = [];
    RowCtxToolbarAction::$seen = [];
    RowCtxModalForm::$seenTenant = null;

    Lattice::tables([RowCtxInheritanceTable::class, RowCtxModalTable::class]);
    Lattice::actions([RowCtxInheritanceAction::class, RowCtxToolbarAction::class]);
    Lattice::forms([RowCtxModalForm::class]);
});

test('a row action modal closure built inside a table frame lets its embedded form inherit the table context', function (): void {
    wire(Table::use(RowCtxModalTable::class, ['tenant' => 'acme']));

    expect(RowCtxModalForm::$seenTenant)->toBe('acme');
});

test('row actions inherit the table context on the build path', function (): void {
    $table = wire(Table::use(RowCtxInheritanceTable::class, ['tenant' => 'acme']));

    expect($table['props']['data'][0]['actions'][0]['id'])->toBe('ctx-inherit.row-action')
        ->and(RowCtxInheritanceAction::$seen['definition_tenant'])->toBe('acme')
        ->and(RowCtxInheritanceAction::$seen['definition_user'])->toBe(1)
        ->and(RowCtxInheritanceAction::$seen['definition_table'])->toBeNull();
});

test('row actions are filtered without inheritance when the whitelist is empty', function (): void {
    config()->set('lattice.context.inherited_keys', []);

    $table = wire(Table::use(RowCtxInheritanceTable::class, ['tenant' => 'acme']));

    expect($table['props']['data'][0]['actions'] ?? [])->toBeEmpty();
});

test('row actions inherit the trusted table context on the endpoint response path', function (): void {
    $this->loadTable(RowCtxInheritanceTable::class, [], ['tenant' => 'acme'])
        ->assertOk()
        ->assertJsonPath('data.0.actions.0.id', 'ctx-inherit.row-action');

    expect(RowCtxInheritanceAction::$seen['definition_tenant'])->toBe('acme');
});

test('toolbar actions keep their explicit context, inherit the table context, and get the table key sealed', function (): void {
    $table = wire(Table::use(RowCtxInheritanceTable::class, ['tenant' => 'acme']));

    $toolbarAction = wireNode($table, 'ctx-inherit.toolbar-action');
    assert($toolbarAction !== null);

    postJson('/lattice/actions/ctx-inherit.toolbar-action', [], ['X-Lattice-Ref' => $toolbarAction['props']['ref']])
        ->assertOk();

    expect(RowCtxToolbarAction::$seen['handle_flavor'])->toBe('spicy')
        ->and(RowCtxToolbarAction::$seen['handle_tenant'])->toBe('acme')
        ->and(RowCtxToolbarAction::$seen['handle_table'])->toBe('ctx-inherit.table');
});

#[AsTable('ctx-inherit.table')]
final class RowCtxInheritanceTable extends TableDefinition
{
    public function columns(): array
    {
        return [TextColumn::make('name')];
    }

    public function source(): TableSource
    {
        return new CallbackTableSource(fn (TableQuery $query): TableResult => TableResult::make([
            ['id' => 1, 'name' => 'Taylor'],
        ]));
    }

    #[Override]
    public function actions(array $row): array
    {
        return [ActionComponent::use(RowCtxInheritanceAction::class, ['user' => $row['id']])];
    }

    #[Override]
    public function toolbar(): array
    {
        return [ActionComponent::use(RowCtxToolbarAction::class, ['flavor' => 'spicy'])];
    }
}

#[AsAction('ctx-inherit.row-action')]
final class RowCtxInheritanceAction extends ActionDefinition
{
    /** @var array<string, mixed> */
    public static array $seen = [];

    public function definition(ActionComponent $action): ActionComponent
    {
        self::$seen['definition_tenant'] = $this->context('tenant');
        self::$seen['definition_user'] = $this->context('user');
        self::$seen['definition_table'] = $this->context('table');

        return $action->label('Row action');
    }

    public function handle(Request $request): ActionResult
    {
        return ActionResult::success();
    }

    #[Override]
    public function authorize(Request $request): bool
    {
        return $this->context('tenant') === 'acme';
    }
}

#[AsAction('ctx-inherit.toolbar-action')]
final class RowCtxToolbarAction extends ActionDefinition
{
    /** @var array<string, mixed> */
    public static array $seen = [];

    public function definition(ActionComponent $action): ActionComponent
    {
        return $action->label('Toolbar action');
    }

    public function handle(Request $request): ActionResult
    {
        self::$seen['handle_flavor'] = $this->context('flavor');
        self::$seen['handle_tenant'] = $this->context('tenant');
        self::$seen['handle_table'] = $this->context('table');

        return ActionResult::success();
    }
}

#[AsTable('ctx-inherit.modal-table')]
final class RowCtxModalTable extends TableDefinition
{
    public function columns(): array
    {
        return [TextColumn::make('name')];
    }

    public function source(): TableSource
    {
        return new CallbackTableSource(fn (TableQuery $query): TableResult => TableResult::make([
            ['id' => 1, 'name' => 'Taylor'],
        ]));
    }

    #[Override]
    public function actions(array $row): array
    {
        return [
            Button::make('Details')->modal(fn (): Modal => Modal::make('row-modal')->schema([
                FormComponent::use(RowCtxModalForm::class),
            ])),
        ];
    }
}

#[AsForm('ctx-inherit.modal-form')]
final class RowCtxModalForm extends FormDefinition
{
    public static ?string $seenTenant = null;

    public function definition(FormComponent $form, Request $request): FormComponent
    {
        $tenant = $this->context('tenant');
        self::$seenTenant = is_string($tenant) ? $tenant : null;

        return $form->schema([]);
    }

    public function handle(Request $request): Response
    {
        return new Response('ok');
    }
}
