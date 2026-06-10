<?php

declare(strict_types=1);

namespace Workbench\App\Actions;

use Illuminate\Http\Request;
use Lattice\Lattice\Actions\ActionDefinition;
use Lattice\Lattice\Actions\ActionResult;
use Lattice\Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Lattice\Attributes\Action;
use Lattice\Lattice\Core\Enums\HttpMethod;
use Lattice\Lattice\Core\Enums\ToastVariant;
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
            ->toast(ToastVariant::Success, 'Product archived.')
            ->reloadComponent('workbench.products');
    }

    private function product(Request $request): Product
    {
        return Product::query()->findOrFail($this->context($request, 'product_id'));
    }
}
