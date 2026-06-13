<?php
declare(strict_types=1);

namespace Workbench\App\Actions;

use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Lattice\Lattice\Actions\ActionResult;
use Lattice\Lattice\Actions\BulkActionDefinition;
use Lattice\Lattice\Actions\Components\Action;
use Lattice\Lattice\Attributes\BulkAction;
use Lattice\Lattice\Core\Enums\ButtonVariant;
use Lattice\Lattice\Core\Enums\HttpMethod;
use Lattice\Lattice\Core\Enums\ToastVariant;
use Workbench\App\Models\Product;

#[BulkAction('workbench.products.archive-selected')]
class ArchiveSelectedProductsAction extends BulkActionDefinition
{
    public function definition(Action $action): Action
    {
        return $action
            ->label('Archive selected')
            ->method(HttpMethod::Patch)
            ->variant(ButtonVariant::Destructive);
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
            ->toast(ToastVariant::Success, "Archived {$records->count()} products.")
            ->reloadComponent('workbench.products');
    }
}
