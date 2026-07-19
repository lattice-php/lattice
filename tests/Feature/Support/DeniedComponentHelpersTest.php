<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Lattice\Lattice\Actions\ActionDefinition;
use Lattice\Lattice\Actions\ActionResult;
use Lattice\Lattice\Actions\BulkActionDefinition;
use Lattice\Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Lattice\Attributes\AsAction;
use Lattice\Lattice\Attributes\AsBulkAction;
use Lattice\Lattice\Attributes\AsForm;
use Lattice\Lattice\Attributes\AsTable;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Forms\FormDefinition;
use Lattice\Lattice\Tables\CallbackTableSource;
use Lattice\Lattice\Tables\Columns\TextColumn;
use Lattice\Lattice\Tables\Contracts\TableSource;
use Lattice\Lattice\Tables\TableDefinition;
use Lattice\Lattice\Tables\TableQuery;
use Lattice\Lattice\Tables\TableResult;
use Symfony\Component\HttpFoundation\Response;

test('a plain callAction cannot even build the request for a denied action', function (): void {
    Lattice::actions([DeniedHelperAction::class]);

    expect(function (): void {
        $this->callAction(DeniedHelperAction::class);
    })->toThrow(LogicException::class, 'must not serialize');
});

test('callDeniedAction seals the ref directly and reaches the endpoint as a 403', function (): void {
    Lattice::actions([DeniedHelperAction::class]);

    $this->callDeniedAction(DeniedHelperAction::class)->assertForbidden();
});

test('submitDeniedForm seals the ref directly and reaches the endpoint as a 403', function (): void {
    Lattice::forms([DeniedHelperForm::class]);

    $this->submitDeniedForm(DeniedHelperForm::class)->assertForbidden();
});

test('loadDeniedTable seals the ref directly and reaches the endpoint as a 403', function (): void {
    Lattice::tables([DeniedHelperTable::class]);

    $this->loadDeniedTable(DeniedHelperTable::class)->assertForbidden();
});

test('callDeniedBulkAction seals the ref directly and reaches the endpoint as a 403', function (): void {
    Lattice::bulkActions([DeniedHelperBulkAction::class]);

    $this->callDeniedBulkAction(DeniedHelperBulkAction::class, [], ['table' => 'helper.denied-table'])
        ->assertForbidden();
});

#[AsAction('helper.denied-action')]
final class DeniedHelperAction extends ActionDefinition
{
    public function definition(ActionComponent $action): ActionComponent
    {
        return $action->label('Denied action');
    }

    public function handle(Request $request): ActionResult
    {
        return ActionResult::success();
    }

    #[Override]
    public function authorize(Request $request): bool
    {
        return false;
    }
}

#[AsForm('helper.denied-form')]
final class DeniedHelperForm extends FormDefinition
{
    public function definition(Form $form, Request $request): Form
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
        return false;
    }
}

#[AsTable('helper.denied-table')]
final class DeniedHelperTable extends TableDefinition
{
    public function columns(): array
    {
        return [TextColumn::make('name')];
    }

    public function source(): TableSource
    {
        return new CallbackTableSource(fn (TableQuery $query): TableResult => TableResult::make([]));
    }

    #[Override]
    public function authorize(Request $request): bool
    {
        return false;
    }
}

#[AsBulkAction('helper.denied-bulk-action')]
final class DeniedHelperBulkAction extends BulkActionDefinition
{
    public function definition(ActionComponent $action): ActionComponent
    {
        return $action->label('Denied bulk action');
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
        return false;
    }
}
