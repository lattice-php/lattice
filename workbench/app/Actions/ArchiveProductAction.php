<?php

declare(strict_types=1);

namespace Workbench\App\Actions;

use Bambamboole\Lattice\Actions\ActionDefinition;
use Bambamboole\Lattice\Actions\ActionResult;
use Bambamboole\Lattice\Actions\Components\Action as ActionComponent;
use Bambamboole\Lattice\Attributes\Action;
use Bambamboole\Lattice\Core\Enums\HttpMethod;
use Bambamboole\Lattice\Toasts\Enums\ToastType;
use Illuminate\Http\Request;
use Workbench\App\Models\Product;

#[Action('workbench.products.archive')]
class ArchiveProductAction extends ActionDefinition
{
    public function definition(ActionComponent $action): ActionComponent
    {
        return $action
            ->label('Archive')
            ->method(HttpMethod::Patch)
            ->variant('destructive')
            ->confirm('Archive product?', 'This hides the product from the catalogue.');
    }

    public function authorize(Request $request): bool
    {
        return $this->product($request)->status !== 'archived';
    }

    public function handle(Request $request): ActionResult
    {
        $product = $this->product($request);
        $product->update(['status' => 'archived']);

        return ActionResult::success(['id' => $product->getKey()])
            ->toast(ToastType::Success, 'Product archived.')
            ->reloadComponent('workbench.products');
    }

    private function product(Request $request): Product
    {
        return Product::query()->findOrFail($this->context($request, 'product_id'));
    }
}
