<?php
declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Lattice\Attributes\AsPage;
use Lattice\Lattice\Core\Components\Button;
use Lattice\Lattice\Core\Components\Heading;
use Lattice\Lattice\Core\Components\Stack;
use Lattice\Lattice\Core\Enums\Align;
use Lattice\Lattice\Core\Enums\Gap;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Tables\Components\Table;
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
                        ->direction('row')
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
