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
use Lattice\Lattice\Forms\Components\Textarea;
use Workbench\App\Models\Product;

#[BulkAction('workbench.products.reject-selected')]
class RejectSelectedProductsAction extends BulkActionDefinition
{
    public function definition(Action $action): Action
    {
        return $action
            ->label('Reject selected')
            ->method(HttpMethod::Patch)
            ->variant(ButtonVariant::Destructive)
            ->confirm('Reject selected products?', 'Tell the sellers why these products are rejected.', 'Submit rejection')
            ->form([
                Textarea::make('reason', 'Reason')->required()->rules(['string', 'max:255']),
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
            ->toast(ToastVariant::Success, "Rejected {$records->count()} products: {$data['reason']}")
            ->reloadComponent('workbench.products');
    }
}
