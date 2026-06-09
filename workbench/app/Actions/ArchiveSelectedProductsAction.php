<?php

declare(strict_types=1);

namespace Workbench\App\Actions;

use Bambamboole\Lattice\Actions\ActionResult;
use Bambamboole\Lattice\Actions\BulkActionDefinition;
use Bambamboole\Lattice\Attributes\BulkAction;
use Bambamboole\Lattice\Core\Components\Action;
use Bambamboole\Lattice\Enums\HttpMethod;
use Bambamboole\Lattice\Enums\ToastType;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Workbench\App\Models\Product;

#[BulkAction('workbench.products.archive-selected')]
class ArchiveSelectedProductsAction extends BulkActionDefinition
{
    public function definition(Action $action): Action
    {
        return $action
            ->label('Archive selected')
            ->method(HttpMethod::Patch)
            ->variant('destructive');
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
            ->toast(ToastType::Success, "Archived {$records->count()} products.")
            ->reloadComponent('workbench.products');
    }
}
