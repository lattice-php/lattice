<?php
declare(strict_types=1);

namespace Workbench\App\Actions;

use Illuminate\Http\Request;
use Lattice\Lattice\Actions\ActionResult;
use Lattice\Lattice\Actions\Components\Action;
use Lattice\Lattice\Actions\FormActionDefinition;
use Lattice\Lattice\Attributes\Action as ActionAttribute;
use Lattice\Lattice\Core\Enums\HttpMethod;
use Lattice\Lattice\Core\Enums\ToastVariant;
use Lattice\Lattice\Core\Values\ToastMessage;
use Lattice\Lattice\Forms\Components\Form;
use Workbench\App\Forms\ProductForm;
use Workbench\App\Models\Product;

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
            'price' => $product->price,
            'status' => $product->status,
            'related_products' => $product->relatedProducts()->pluck('products.id')->all(),
        ]);
    }

    public function handle(Request $request): ActionResult
    {
        $data = $this->validate($request);
        $product = $this->product($request);

        $relatedIds = $data['related_products'] ?? [];
        unset($data['related_products']);

        $product->update($data);
        $product->relatedProducts()->sync(
            Product::query()->whereIn('id', $relatedIds)->pluck('id')->all(),
        );

        return ActionResult::success(['id' => $product->getKey()])
            ->toast(
                ToastMessage::make(ToastVariant::Success, __('workbench.actions.edit.toast'))
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
