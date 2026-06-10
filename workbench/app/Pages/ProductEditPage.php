<?php

declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Lattice\Core\Components\Heading;
use Lattice\Lattice\Core\Components\Stack;
use Lattice\Lattice\Core\Enums\Gap;
use Lattice\Lattice\Core\Enums\HttpMethod;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Http\Page;
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
        return $schema->schema([
            Stack::make('product-edit-page')
                ->gap(Gap::Large)
                ->schema([
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
