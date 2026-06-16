<?php
declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Lattice\Attributes\AsPage;
use Lattice\Lattice\Core\Components\Heading;
use Lattice\Lattice\Core\Components\Stack;
use Lattice\Lattice\Core\Enums\Gap;
use Lattice\Lattice\Core\Enums\HttpMethod;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Forms\Components\Form;
use Workbench\App\Forms\BusinessPartnerForm;
use Workbench\App\Models\Address;
use Workbench\App\Models\BusinessPartner;

#[AsPage(route: '/business-partners/{businessPartner}/edit')]
class BusinessPartnerEditPage extends WorkbenchPage
{
    public function title(): string
    {
        return __('workbench.commerce.business-partners.pages.edit.title');
    }

    public function render(PageSchema $schema, BusinessPartner $businessPartner): PageSchema
    {
        $businessPartner->load('groups', 'addresses');

        $addresses = $businessPartner->addresses->map(fn (Address $address): array => [
            'id' => (string) $address->getKey(),
            'label' => $address->label,
            'line1' => $address->line1,
            'line2' => $address->line2,
            'city' => $address->city,
            'postal_code' => $address->postal_code,
            'country' => $address->country,
        ])->all();

        return $schema->schema([
            Stack::make('business-partner-edit-page')
                ->gap(Gap::Large)
                ->schema([
                    Heading::make(__('workbench.commerce.business-partners.pages.edit.heading')),
                    Form::use(BusinessPartnerForm::class)
                        ->method(HttpMethod::Patch)
                        ->submitLabel(__('workbench.commerce.business-partners.pages.edit.submit'))
                        ->fill([
                            'name' => $businessPartner->name,
                            'email' => $businessPartner->email,
                            'groups' => $businessPartner->groups->pluck('id')->map(fn ($id) => (string) $id)->all(),
                            'addresses' => $addresses,
                            'default_shipping_address_id' => $businessPartner->default_shipping_address_id !== null
                                ? (string) $businessPartner->default_shipping_address_id
                                : null,
                            'default_billing_address_id' => $businessPartner->default_billing_address_id !== null
                                ? (string) $businessPartner->default_billing_address_id
                                : null,
                        ])
                        ->context([
                            'business_partner_id' => $businessPartner->getKey(),
                        ]),
                ]),
        ]);
    }
}
