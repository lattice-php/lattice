<?php

declare(strict_types=1);

namespace Workbench\App\Pages;

use Bambamboole\Lattice\Core\Components\Heading;
use Bambamboole\Lattice\Core\Components\Stack;
use Bambamboole\Lattice\Core\Enums\Gap;
use Bambamboole\Lattice\Core\Enums\HttpMethod;
use Bambamboole\Lattice\Core\PageSchema;
use Bambamboole\Lattice\Forms\Components\Form;
use Bambamboole\Lattice\Http\Page;
use Workbench\App\Forms\ProductForm;
use Workbench\App\Models\Product;

class ProductEditPage extends Page
{
    public function title(): string
    {
        return 'Edit Product';
    }

    public function render(PageSchema $schema, Product $product): PageSchema
    {
        return $schema->components([
            Stack::make('product-edit-page')
                ->gap(Gap::Large)
                ->children([
                    Heading::make('Edit Product'),
                    Form::use(ProductForm::class)
                        ->method(HttpMethod::Patch)
                        ->submitLabel('Save product')
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
