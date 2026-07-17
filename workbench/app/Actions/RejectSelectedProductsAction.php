<?php
declare(strict_types=1);

namespace Workbench\App\Actions;

use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Lattice\Lattice\Actions\ActionResult;
use Lattice\Lattice\Actions\BulkActionDefinition;
use Lattice\Lattice\Actions\Components\Action;
use Lattice\Lattice\Attributes\AsBulkAction;
use Lattice\Lattice\Core\Enums\HttpMethod;
use Lattice\Lattice\Forms\Components\Textarea;
use Lattice\Lattice\Ui\Enums\ButtonVariant;
use Lattice\Lattice\Ui\Enums\Variant;
use Workbench\App\Models\Product;

#[AsBulkAction('workbench.products.reject-selected')]
class RejectSelectedProductsAction extends BulkActionDefinition
{
    public function definition(Action $action): Action
    {
        return $action
            ->label(__('workbench.actions.reject-selected.label'))
            ->method(HttpMethod::Patch)
            ->variant(ButtonVariant::Destructive)
            ->confirm(__('workbench.actions.reject-selected.confirm-title'), __('workbench.actions.reject-selected.confirm-description'), __('workbench.actions.reject-selected.confirm-label'))
            ->form([
                Textarea::make('reason', __('workbench.common.reason'))->required()->rules(['string', 'max:255']),
            ]);
    }

    /**
     * @param  Collection<int, mixed>  $records
     */
    public function handle(Collection $records, Request $request): ActionResult
    {
        $data = $this->validate($request);

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
