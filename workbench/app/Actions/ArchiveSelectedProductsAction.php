<?php
declare(strict_types=1);

namespace Workbench\App\Actions;

use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Lattice\Actions\ActionResult;
use Lattice\Actions\BulkActionDefinition;
use Lattice\Actions\Components\Action;
use Lattice\Core\Attributes\AsBulkAction;
use Lattice\Ui\Enums\HttpMethod;
use Lattice\Ui\Enums\Variant;
use Workbench\App\Models\Product;

#[AsBulkAction('workbench.products.archive-selected')]
class ArchiveSelectedProductsAction extends BulkActionDefinition
{
    public function definition(Action $action): Action
    {
        return $action
            ->label(__('workbench.actions.archive-selected.label'))
            ->method(HttpMethod::Patch)
            ->variant(Variant::Danger);
    }

    /**
     * @param  Collection<int, mixed>  $records
     */
    public function handle(Collection $records, Request $request): ActionResult
    {
        $records->each(function (mixed $product): void {
            if ($product instanceof Product) {
                $product->update(['status' => 'archived']);
            }
        });

        return ActionResult::success(['archived' => $records->count()])
            ->toast(__('workbench.actions.archive-selected.toast', ['count' => $records->count()]), Variant::Success)
            ->reloadComponent('workbench.products');
    }
}
