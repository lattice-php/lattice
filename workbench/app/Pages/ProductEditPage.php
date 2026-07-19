<?php
declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Lattice\Attributes\AsPage;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Ui\Components\Heading;
use Lattice\Lattice\Ui\Components\Stack;
use Lattice\Lattice\Ui\Enums\Gap;
use Lattice\Lattice\Ui\Enums\HttpMethod;
use Workbench\App\Forms\ProductForm;
use Workbench\App\Models\Product;

#[AsPage(route: '/products/{product}/edit')]
class ProductEditPage extends WorkbenchPage
{
    public function title(): string
    {
        return __('workbench.pages.product-edit.title');
    }

    public function render(PageSchema $schema, Product $product): PageSchema
    {
        $productForm = app(ProductForm::class);

        return $schema->schema([
            Stack::make('product-edit-page')
                ->gap(Gap::Large)
                ->schema([
                    Heading::make(__('workbench.pages.product-edit.heading')),
                    Form::use(ProductForm::class, ['product_id' => $product->getKey()])
                        ->method(HttpMethod::Patch)
                        ->submitLabel(__('workbench.pages.product-edit.submit'))
                        ->fill([
                            'name' => $product->name,
                            'sku' => $product->sku,
                            'status' => $product->status,
                            'related_products' => $product->relatedProducts()->pluck('products.id')->all(),
                            'images' => $productForm->imagePaths($product),
                            'sales_prices' => $productForm->salesPriceRows($product),
                        ]),
                ]),
        ]);
    }
}
