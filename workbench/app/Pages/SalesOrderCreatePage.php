<?php
declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Lattice\Attributes\AsPage;
use Lattice\Lattice\Core\Enums\HttpMethod;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Ui\Components\Heading;
use Lattice\Lattice\Ui\Components\Stack;
use Lattice\Lattice\Ui\Enums\Gap;
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
