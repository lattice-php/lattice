<?php
declare(strict_types=1);

namespace Workbench\App\Actions;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Lattice\Lattice\Actions\ActionResult;
use Lattice\Lattice\Actions\Components\Action;
use Lattice\Lattice\Actions\FormActionDefinition;
use Lattice\Lattice\Attributes\AsAction;
use Lattice\Lattice\Effects\Builtin\Toast;
use Lattice\Lattice\Forms\Components\FileUpload;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Ui\Enums\HttpMethod;
use Lattice\Lattice\Ui\Enums\Variant;
use Workbench\App\Forms\ProductForm;
use Workbench\App\Models\Product;

#[AsAction('workbench.products.edit-modal')]
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
        $product = $this->product();
        $productForm = app(ProductForm::class)->withContext(['product_id' => $product->getKey()]);

        return $productForm->definition($form, $request)->fill([
            'name' => $product->name,
            'sku' => $product->sku,
            'status' => $product->status,
            'related_products' => $product->relatedProducts()->pluck('products.id')->all(),
            'images' => $productForm->imagePaths($product),
            'sales_prices' => $productForm->salesPriceRows($product),
        ]);
    }

    public function handle(Request $request): ActionResult
    {
        $data = $this->validate($request);
        $product = $this->product();

        $relatedIds = $data['related_products'] ?? [];
        $priceRows = $data['sales_prices'] ?? [];
        $productForm = app(ProductForm::class);
        $imageKeys = $productForm->uploadedImageKeys($data['images'] ?? []);
        $removedImagePaths = FileUpload::removed($request, 'images');
        unset($data['related_products'], $data['sales_prices'], $data['images']);

        DB::transaction(function () use ($product, $data, $relatedIds, $priceRows, $productForm, $imageKeys, $removedImagePaths): void {
            $product->update($data);
            $product->relatedProducts()->sync(
                Product::query()->whereIn('id', $relatedIds)->pluck('id')->all(),
            );

            $productForm->syncSalesPrices($product, $priceRows);
            $productForm->syncImages($product, $imageKeys, $removedImagePaths);
        });

        return ActionResult::success(['id' => $product->getKey()])
            ->toast(
                Toast::make(__('workbench.actions.edit.toast'), Variant::Success)
                    ->action(
                        Action::use(RejectProductAction::class, ['product_id' => $product->getKey()])
                            ->label(__('workbench.actions.edit.reject-product')),
                    )
                    ->persistent(),
            )
            ->reloadComponent('workbench.products');
    }

    private function product(): Product
    {
        return Product::query()->findOrFail($this->context('product_id'));
    }
}
