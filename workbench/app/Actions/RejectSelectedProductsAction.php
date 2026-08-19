<?php
declare(strict_types=1);

namespace Workbench\App\Actions;

use Illuminate\Support\Collection;
use Lattice\Actions\ActionResult;
use Lattice\Actions\BulkActionDefinition;
use Lattice\Actions\Components\Action;
use Lattice\Core\Attributes\AsBulkAction;
use Lattice\Form\Components\Textarea;
use Lattice\Form\FormData;
use Lattice\Ui\Enums\HttpMethod;
use Lattice\Ui\Enums\Variant;
use Workbench\App\Models\Product;

#[AsBulkAction('workbench.products.reject-selected')]
class RejectSelectedProductsAction extends BulkActionDefinition
{
    public function definition(Action $action): Action
    {
        return $action
            ->label(__('workbench.actions.reject-selected.label'))
            ->method(HttpMethod::Patch)
            ->variant(Variant::Danger)
            ->confirm(__('workbench.actions.reject-selected.confirm-title'), __('workbench.actions.reject-selected.confirm-description'), __('workbench.actions.reject-selected.confirm-label'))
            ->form([
                Textarea::make('reason', __('workbench.common.reason'))->required()->rules(['string', 'max:255']),
            ]);
    }

    /**
     * @param  Collection<int, mixed>  $records
     */
    public function handle(Collection $records, FormData $data): ActionResult
    {
        $records->each(function (mixed $product): void {
            if ($product instanceof Product) {
                $product->update(['status' => 'archived']);
            }
        });

        return ActionResult::success(['archived' => $records->count(), 'reason' => $data['reason']])
            ->toast(__('workbench.actions.reject-selected.toast', ['count' => $records->count(), 'reason' => $data['reason']]), Variant::Success)
            ->reloadComponent('workbench.products');
    }
}
