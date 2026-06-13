<?php
declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Lattice\Attributes\Page;
use Lattice\Lattice\Core\Components\Heading;
use Lattice\Lattice\Core\Components\Stack;
use Lattice\Lattice\Core\Enums\Gap;
use Lattice\Lattice\Core\Enums\HttpMethod;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Forms\Components\Form;
use Workbench\App\Forms\ProductForm;
use Workbench\App\Models\Product;

#[Page(route: '/products/{product}/edit')]
class ProductEditPage extends WorkbenchPage
{
    public function title(): string
    {
        return __('workbench.pages.product-edit.title');
    }

    public function render(PageSchema $schema, Product $product): PageSchema
    {
        return $schema->schema([
            Stack::make('product-edit-page')
                ->gap(Gap::Large)
                ->schema([
                    Heading::make(__('workbench.pages.product-edit.heading')),
                    Form::use(ProductForm::class)
                        ->method(HttpMethod::Patch)
                        ->submitLabel(__('workbench.pages.product-edit.submit'))
                        ->fill([
                            'name' => $product->name,
                            'sku' => $product->sku,
                            'price' => $product->price,
                            'status' => $product->status,
                            'related_products' => $product->relatedProducts()->pluck('products.id')->all(),
                        ])
                        ->context([
                            'product_id' => $product->getKey(),
                        ]),
                ]),
        ]);
    }
}
