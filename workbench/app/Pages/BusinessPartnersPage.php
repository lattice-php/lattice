<?php
declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Core\Attributes\AsPage;
use Lattice\Table\Components\Table;
use Lattice\Ui\Components\Button;
use Lattice\Ui\Components\Heading;
use Lattice\Ui\Components\Stack;
use Lattice\Ui\Enums\Align;
use Lattice\Ui\Enums\Gap;
use Lattice\Ui\Enums\Orientation;
use Lattice\Ui\PageSchema;
use Workbench\App\Tables\BusinessPartnersTable;

#[AsPage(route: '/business-partners', name: 'business-partners.index')]
class BusinessPartnersPage extends WorkbenchPage
{
    public function title(): string
    {
        return __('workbench.commerce.business-partners.pages.index.title');
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([
            Stack::make('business-partners-page')
                ->gap(Gap::Large)
                ->schema([
                    Stack::make('business-partners-header')
                        ->direction(Orientation::Horizontal)
                        ->align(Align::Center)
                        ->schema([
                            Heading::make(__('workbench.commerce.business-partners.pages.index.heading')),
                            Button::make(__('workbench.commerce.business-partners.pages.index.create'), 'create-business-partner')
                                ->href('/business-partners/create'),
                        ]),
                    Table::use(BusinessPartnersTable::class),
                ]),
        ]);
    }
}
