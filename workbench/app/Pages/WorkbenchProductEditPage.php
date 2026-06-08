<?php

declare(strict_types=1);

namespace Workbench\App\Pages;

use Bambamboole\Lattice\Components\Core\Heading;
use Bambamboole\Lattice\Components\Core\Stack;
use Bambamboole\Lattice\Components\Form\Form;
use Bambamboole\Lattice\Enums\Gap;
use Bambamboole\Lattice\Enums\HttpMethod;
use Bambamboole\Lattice\Page;
use Bambamboole\Lattice\PageSchema;
use Workbench\App\Forms\ProductForm;
use Workbench\App\Models\Product;

class WorkbenchProductEditPage extends Page
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
                        ])
                        ->context([
                            'product_id' => $product->getKey(),
                        ]),
                ]),
        ]);
    }
}
