<?php
declare(strict_types=1);

namespace Workbench\App\Fragments;

use Lattice\Core\Attributes\AsFragment;
use Lattice\Fragments\FragmentDefinition;
use Lattice\Ui\Components\Heading;
use Lattice\Ui\Components\Stack;
use Lattice\Ui\Components\Text;
use Lattice\Ui\Enums\Gap;
use Lattice\Ui\PageSchema;
use Workbench\App\Models\BusinessPartner;

/**
 * The card shown in the popover behind a sales-order row's business-partner
 * cell, loaded lazily over AJAX from the row's `businessPartnerId` context.
 */
#[AsFragment('workbench.business-partner-card')]
final class BusinessPartnerCardFragment extends FragmentDefinition
{
    public function schema(PageSchema $schema): PageSchema
    {
        $partner = BusinessPartner::query()
            ->withCount('salesOrders')
            ->find($this->contextIntOrNull('businessPartnerId'));

        if ($partner === null) {
            return $schema->component(Text::make(__('workbench.commerce.business-partners.card.missing')));
        }

        return $schema->component(
            Stack::make('business-partner-card-'.$partner->getKey())->gap(Gap::Small)->schema(array_values(array_filter([
                Heading::make($partner->name, 3),
                $partner->email !== null ? Text::make($partner->email) : null,
                Text::make(__('workbench.commerce.business-partners.card.orders', ['count' => $partner->sales_orders_count])),
            ]))),
        );
    }
}
