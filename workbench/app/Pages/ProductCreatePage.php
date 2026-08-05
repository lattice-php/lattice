<?php
declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Core\Attributes\AsPage;
use Lattice\Form\Components\Form;
use Lattice\Ui\Components\Heading;
use Lattice\Ui\Components\Stack;
use Lattice\Ui\Enums\Gap;
use Lattice\Ui\Enums\HttpMethod;
use Lattice\Ui\PageSchema;
use Workbench\App\Forms\ProductForm;

#[AsPage(route: '/products/create')]
class ProductCreatePage extends WorkbenchPage
{
    public function title(): string
    {
        return __('workbench.pages.product-create.title');
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([
            Stack::make('product-create-page')
                ->gap(Gap::Large)
                ->schema([
                    Heading::make(__('workbench.pages.product-create.heading')),
                    Form::use(ProductForm::class)
                        ->method(HttpMethod::Post)
                        ->submitLabel(__('workbench.pages.product-create.submit')),
                ]),
        ]);
    }
}
