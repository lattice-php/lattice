<?php
declare(strict_types=1);

namespace Workbench\App\Actions;

use Illuminate\Http\Request;
use Lattice\Lattice\Actions\ActionResult;
use Lattice\Lattice\Actions\Components\Action;
use Lattice\Lattice\Actions\FormActionDefinition;
use Lattice\Lattice\Attributes\Action as ActionAttribute;
use Lattice\Lattice\Core\Enums\HttpMethod;
use Lattice\Lattice\Core\Enums\Variant;
use Lattice\Lattice\Core\Values\ToastMessage;
use Lattice\Lattice\Forms\Components\Form;
use Workbench\App\Forms\ProductForm;
use Workbench\App\Models\Product;
use Workbench\App\Models\SalesPrice;

#[ActionAttribute('workbench.products.edit-modal')]
class EditProductAction extends FormActionDefinition
{
    public function definition(Action $action): Action
    {
        return $action
            ->label(__('workbench.actions.edit.label'))
            ->method(HttpMethod::Patch)
            ->confirm(__('workbench.actions.edit.confirm-title'), __('workbench.actions.edit.confirm-description'), __('workbench.actions.edit.confirm-label'));
    }

    public function formSchema(Form $form, Request $request): Form
    {
        $product = $this->product($request);

        // Reuse the registered form's schema, then prefill the record's values.
        return app(ProductForm::class)->definition($form, $request)->fill([
            'name' => $product->name,
            'sku' => $product->sku,
            'status' => $product->status,
            'related_products' => $product->relatedProducts()->pluck('products.id')->all(),
            'sales_prices' => $product->salesPrices()
                ->orderByRaw('group_id is null desc')
                ->orderBy('group_id')
                ->get()
                ->map(fn (SalesPrice $salesPrice): array => [
                    'group_id' => $salesPrice->group_id !== null ? (string) $salesPrice->group_id : '',
                    'amount' => $salesPrice->amount,
                ])
                ->all(),
        ]);
    }

    public function handle(Request $request): ActionResult
    {
        $data = $this->validate($request);
        $product = $this->product($request);

        $relatedIds = $data['related_products'] ?? [];
        $priceRows = $data['sales_prices'] ?? [];
        unset($data['related_products'], $data['sales_prices']);

        $product->update($data);
        $product->relatedProducts()->sync(
            Product::query()->whereIn('id', $relatedIds)->pluck('id')->all(),
        );

        app(ProductForm::class)->syncSalesPrices($product, $priceRows);

        return ActionResult::success(['id' => $product->getKey()])
            ->toast(
                ToastMessage::make(Variant::Success, __('workbench.actions.edit.toast'))
                    ->action(
                        Action::use(RejectProductAction::class)
                            ->label(__('workbench.actions.edit.reject-product'))
                            ->context(['product_id' => $product->getKey()]),
                    )
                    ->persistent(),
            )
            ->reloadComponent('workbench.products');
    }

    private function product(Request $request): Product
    {
        return Product::query()->findOrFail($this->context($request, 'product_id'));
    }
}
