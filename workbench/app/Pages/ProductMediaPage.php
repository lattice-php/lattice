<?php
declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Core\Attributes\AsPage;
use Lattice\Form\Components\Form;
use Lattice\Table\Components\Table;
use Lattice\Ui\Components\Heading;
use Lattice\Ui\Components\Stack;
use Lattice\Ui\Enums\Gap;
use Lattice\Ui\Enums\HttpMethod;
use Lattice\Ui\PageSchema;
use Workbench\App\Forms\ProductMediaForm;
use Workbench\App\Models\Product;
use Workbench\App\Tables\ProductMediaTable;

#[AsPage(route: '/media-picker')]
final class ProductMediaPage extends WorkbenchPage
{
    public function title(): string
    {
        return __('workbench.pages.product-media.title');
    }

    public function render(PageSchema $schema): PageSchema
    {
        $product = $this->product();

        return $schema->schema([
            Stack::make('product-media-page')
                ->gap(Gap::Large)
                ->schema([
                    Heading::make(__('workbench.pages.product-media.heading')),
                    Form::use(ProductMediaForm::class, ['product_id' => $product->getKey()])
                        ->method(HttpMethod::Post)
                        ->submitLabel(__('workbench.pages.product-media.submit'))
                        ->fill([
                            'gallery' => $product->mediaPickerValue('gallery'),
                            'body' => $product->body,
                        ]),
                    Table::use(ProductMediaTable::class),
                ]),
        ]);
    }

    private function product(): Product
    {
        return Product::query()->where('name', __('workbench.pages.product-media.product'))->first()
            ?? Product::factory()->create(['name' => __('workbench.pages.product-media.product')]);
    }
}
