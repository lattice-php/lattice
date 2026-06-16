<?php
declare(strict_types=1);

namespace Workbench\App\Actions;

use Illuminate\Http\Request;
use Lattice\Lattice\Actions\ActionDefinition;
use Lattice\Lattice\Actions\ActionResult;
use Lattice\Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Lattice\Attributes\Action;
use Lattice\Lattice\Core\Components\Link;
use Lattice\Lattice\Core\Enums\ButtonVariant;
use Lattice\Lattice\Core\Enums\HttpMethod;
use Lattice\Lattice\Core\Enums\Variant;
use Lattice\Lattice\Core\Values\ToastMessage;
use Workbench\App\Models\Product;

#[Action('workbench.products.archive')]
class ArchiveProductAction extends ActionDefinition
{
    public function definition(ActionComponent $action): ActionComponent
    {
        return $action
            ->label(__('workbench.actions.archive.label'))
            ->method(HttpMethod::Patch)
            ->variant(ButtonVariant::Destructive)
            ->confirm(__('workbench.actions.archive.confirm-title'), __('workbench.actions.archive.confirm-description'));
    }

    #[\Override]
    public function authorize(Request $request): bool
    {
        return $this->product($request)->status !== 'archived';
    }

    public function handle(Request $request): ActionResult
    {
        $product = $this->product($request);
        $product->update(['status' => 'archived']);

        return ActionResult::success(['id' => $product->getKey()])
            ->toast(
                ToastMessage::make(Variant::Success, __('workbench.actions.archive.toast'))
                    ->action(Link::make(__('workbench.actions.archive.view-products'), 'view-products')->href('/products'))
                    ->persistent(),
            )
            ->reloadComponent('workbench.products');
    }

    private function product(Request $request): Product
    {
        return Product::query()->findOrFail($this->context($request, 'product_id'));
    }
}
