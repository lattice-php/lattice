<?php
declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Core\Attributes\AsPage;
use Lattice\Core\Breadcrumb;
use Lattice\Form\Components\Form;
use Lattice\Ui\Components\Heading;
use Lattice\Ui\Components\Stack;
use Lattice\Ui\Enums\Gap;
use Lattice\Ui\Enums\HttpMethod;
use Lattice\Ui\PageSchema;
use Workbench\App\Forms\ProductForm;
use Workbench\App\Models\Product;

#[AsPage(route: '/products/{product}/edit')]
class ProductEditPage extends WorkbenchPage
{
    public function render(PageSchema $schema, Product $product): PageSchema
    {
        $productForm = app(ProductForm::class);

        return $schema
            ->title($product->name)
            ->breadcrumbs([
                Breadcrumb::toPage(ProductsPage::class)->title(__('workbench.pages.products.title')),
                Breadcrumb::toPage(self::class, ['product' => $product->getKey()])->title($product->name),
            ])
            ->schema([
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
