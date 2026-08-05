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
use Workbench\App\Forms\SalesOrderForm;

#[AsPage(route: '/sales-orders/create')]
class SalesOrderCreatePage extends WorkbenchPage
{
    public function title(): string
    {
        return __('workbench.commerce.sales-orders.pages.create.title');
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([
            Stack::make('sales-order-create-page')
                ->gap(Gap::Large)
                ->schema([
                    Heading::make(__('workbench.commerce.sales-orders.pages.create.heading')),
                    Form::use(SalesOrderForm::class)
                        ->method(HttpMethod::Post)
                        ->submitLabel(__('workbench.commerce.sales-orders.pages.create.submit')),
                ]),
        ]);
    }
}
