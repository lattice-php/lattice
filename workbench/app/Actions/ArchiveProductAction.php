<?php
declare(strict_types=1);

namespace Workbench\App\Actions;

use Illuminate\Http\Request;
use Lattice\Actions\ActionDefinition;
use Lattice\Actions\ActionResult;
use Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Core\Attributes\AsAction;
use Lattice\Core\Concerns\ResolvesContextModels;
use Lattice\Ui\Components\Link;
use Lattice\Ui\Effects\Builtin\Toast;
use Lattice\Ui\Enums\HttpMethod;
use Lattice\Ui\Enums\Variant;
use Workbench\App\Models\Product;

#[AsAction('workbench.products.archive')]
class ArchiveProductAction extends ActionDefinition
{
    use ResolvesContextModels;

    public function definition(ActionComponent $action): ActionComponent
    {
        return $action
            ->label(__('workbench.actions.archive.label'))
            ->method(HttpMethod::Patch)
            ->variant(Variant::Danger)
            ->confirm(__('workbench.actions.archive.confirm-title'), __('workbench.actions.archive.confirm-description'));
    }

    #[\Override]
    public function authorize(Request $request): bool
    {
        return $this->product()->status !== 'archived';
    }

    public function handle(Request $request): ActionResult
    {
        $product = $this->product();
        $product->update(['status' => 'archived']);

        return ActionResult::success(['id' => $product->getKey()])
            ->toast(
                Toast::make(__('workbench.actions.archive.toast'), Variant::Success)
                    ->action(Link::make(__('workbench.actions.archive.view-products'), 'view-products')->href('/products'))
                    ->persistent(),
            )
            ->reloadComponent('workbench.products');
    }

    private function product(): Product
    {
        return $this->contextModel('product_id', Product::class);
    }
}
