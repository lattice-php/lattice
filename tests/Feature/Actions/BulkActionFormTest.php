<?php
declare(strict_types=1);

use Illuminate\Support\Collection;
use Lattice\Actions\ActionResult;
use Lattice\Actions\BulkActionDefinition;
use Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Core\Attributes\AsBulkAction;
use Lattice\Core\Facades\Lattice;
use Lattice\Form\Components\TextInput;
use Lattice\Form\FormData;
use Lattice\Table\Attributes\AsTable;
use Lattice\Table\CallbackTableSource;
use Lattice\Table\Columns\TextColumn;
use Lattice\Table\Contracts\TableSource;
use Lattice\Table\TableDefinition;
use Lattice\Table\TableQuery;
use Lattice\Table\TableResult;
use Lattice\Ui\Enums\HttpMethod;

test('a bulk action validates its embedded form before resolving records or running handle', function (): void {
    Lattice::tables([BulkFormTable::class]);
    Lattice::bulkActions([RequiredReasonBulkAction::class]);
    RequiredReasonBulkAction::$handled = false;

    $this->callBulkAction(RequiredReasonBulkAction::class, [
        'reason' => '',
        'selected' => [1, 2],
    ], ['table' => 'test.bulk-form'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('reason');

    expect(RequiredReasonBulkAction::wasHandled())->toBeFalse();
});

test('bulk action handle(Collection $records, FormData $data) receives both the resolved rows and the validated data', function (): void {
    Lattice::tables([BulkFormTable::class]);
    Lattice::bulkActions([RequiredReasonBulkAction::class]);

    $this->callBulkAction(RequiredReasonBulkAction::class, [
        'reason' => 'Cleanup',
        'selected' => [1, 2],
    ], ['table' => 'test.bulk-form'])
        ->assertOk()
        ->assertJsonPath('data.count', 2)
        ->assertJsonPath('data.reason', 'Cleanup');
});

#[AsBulkAction('test.bulk-form.required-reason')]
class RequiredReasonBulkAction extends BulkActionDefinition
{
    public static bool $handled = false;

    public static function wasHandled(): bool
    {
        return self::$handled;
    }

    public function definition(ActionComponent $action): ActionComponent
    {
        return $action->label('Archive')->method(HttpMethod::Patch)->form([
            TextInput::make('reason', 'Reason')->required(),
        ]);
    }

    /**
     * @param  Collection<int, mixed>  $records
     */
    public function handle(Collection $records, FormData $data): ActionResult
    {
        self::$handled = true;

        return ActionResult::success([
            'count' => $records->count(),
            'reason' => $data->get('reason'),
        ]);
    }
}

#[AsTable('test.bulk-form')]
class BulkFormTable extends TableDefinition
{
    public function columns(): array
    {
        return [TextColumn::make('name')->label('Name')];
    }

    public function source(): TableSource
    {
        return new CallbackTableSource(
            query: fn (TableQuery $query): TableResult => TableResult::make([
                ['id' => 1, 'name' => 'Ada'],
                ['id' => 2, 'name' => 'Grace'],
            ]),
            selection: fn (array $keys): Collection => collect($keys),
        );
    }
}
