<?php
declare(strict_types=1);

namespace Workbench\App\Forms;

use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\Form;
use Lattice\Lattice\Core\Components\Card;
use Lattice\Lattice\Core\Components\Text;
use Lattice\Lattice\Core\EloquentOptions;
use Lattice\Lattice\Core\Option;
use Lattice\Lattice\Forms\Components\Form as FormComponent;
use Lattice\Lattice\Forms\Components\HiddenInput;
use Lattice\Lattice\Forms\Components\Repeater;
use Lattice\Lattice\Forms\Components\Select;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Forms\FormDefinition;
use Symfony\Component\HttpFoundation\Response;
use Workbench\App\Models\Address;
use Workbench\App\Models\BusinessPartner;
use Workbench\App\Models\Group;
use Workbench\App\Pricing\PriceResolver;

#[Form('workbench.business-partners.form')]
class BusinessPartnerForm extends FormDefinition
{
    public function definition(FormComponent $form, Request $request): FormComponent
    {
        $partner = $this->partner($request);

        $schema = [
            Card::make(__('workbench.commerce.business-partners.form.details-card'))->schema([
                TextInput::make('name', __('workbench.commerce.business-partners.fields.name'))
                    ->rules(['required', 'string', 'max:255']),
                TextInput::make('email', __('workbench.commerce.business-partners.fields.email'))
                    ->rules(['nullable', 'email']),
                Select::make('groups', __('workbench.commerce.business-partners.fields.groups'))
                    ->multiple()
                    ->optionsFrom(
                        EloquentOptions::make(Group::class)->label('name')->limit(50),
                    )
                    ->rules(['nullable', 'array']),
                Repeater::make('addresses', __('workbench.commerce.business-partners.fields.addresses'))
                    ->schema([
                        HiddenInput::make('id')->rules(['nullable']),
                        TextInput::make('label', __('workbench.commerce.business-partners.fields.address.label'))
                            ->rules(['required', 'string']),
                        TextInput::make('line1', __('workbench.commerce.business-partners.fields.address.line1'))
                            ->rules(['required', 'string']),
                        TextInput::make('line2', __('workbench.commerce.business-partners.fields.address.line2'))
                            ->rules(['nullable', 'string']),
                        TextInput::make('city', __('workbench.commerce.business-partners.fields.address.city'))
                            ->rules(['required', 'string']),
                        TextInput::make('postal_code', __('workbench.commerce.business-partners.fields.address.postal-code'))
                            ->rules(['required', 'string']),
                        TextInput::make('country', __('workbench.commerce.business-partners.fields.address.country'))
                            ->rules(['required', 'string']),
                    ])
                    ->addLabel(__('workbench.commerce.business-partners.fields.add-address')),
            ]),
        ];

        if ($partner instanceof BusinessPartner) {
            $addresses = $partner->addresses()->get();

            if ($addresses->isNotEmpty()) {
                $addressOptions = $addresses->map(
                    fn (Address $address): Option => Select::option(
                        $address->label.' — '.$address->city,
                        (string) $address->getKey(),
                    ),
                )->all();

                $schema[] = Card::make(__('workbench.commerce.business-partners.form.defaults-card'))->schema([
                    Select::make('default_shipping_address_id', __('workbench.commerce.business-partners.fields.default-shipping-address'))
                        ->options($addressOptions)
                        ->rules(['nullable']),
                    Select::make('default_billing_address_id', __('workbench.commerce.business-partners.fields.default-billing-address'))
                        ->options($addressOptions)
                        ->rules(['nullable']),
                ]);
            }

            $priceList = array_slice(app(PriceResolver::class)->priceList($partner), 0, 15);

            if ($priceList !== []) {
                $priceItems = array_map(
                    fn (array $entry): Text => Text::make($entry['product']->name.': '.($entry['price'] ?? '—')),
                    $priceList,
                );

                $schema[] = Card::make(__('workbench.commerce.business-partners.form.prices-card'))->schema($priceItems);
            }
        }

        return $form->schema($schema);
    }

    public function handle(Request $request): Response
    {
        $partner = $this->partner($request);
        $validated = $this->validate($request);

        $groupIds = $validated['groups'] ?? [];
        $addressRows = $validated['addresses'] ?? [];
        $defaultShippingId = $validated['default_shipping_address_id'] ?? null;
        $defaultBillingId = $validated['default_billing_address_id'] ?? null;

        $partnerData = [
            'name' => $validated['name'],
            'email' => $validated['email'] ?? null,
        ];

        if (! $partner instanceof BusinessPartner) {
            $partner = BusinessPartner::query()->create($partnerData);
        } else {
            $partner->update($partnerData);
        }

        $partner->groups()->sync(
            Group::query()->whereIn('id', $groupIds)->pluck('id')->all(),
        );

        $submittedIds = [];

        foreach ($addressRows as $row) {
            $addressId = isset($row['id']) && $row['id'] !== ''
                ? (int) $row['id']
                : null;

            $addressData = [
                'business_partner_id' => $partner->getKey(),
                'label' => $row['label'],
                'line1' => $row['line1'],
                'line2' => $row['line2'] ?? null,
                'city' => $row['city'],
                'postal_code' => $row['postal_code'],
                'country' => $row['country'],
            ];

            if ($addressId !== null) {
                $address = $partner->addresses()->find($addressId);

                if ($address instanceof Address) {
                    $address->update($addressData);
                    $submittedIds[] = $addressId;
                } else {
                    $created = Address::query()->create($addressData);
                    $submittedIds[] = $created->getKey();
                }
            } else {
                $created = Address::query()->create($addressData);
                $submittedIds[] = $created->getKey();
            }
        }

        $partner->addresses()->whereNotIn('id', $submittedIds)->delete();

        $partnerAddressIds = $partner->addresses()->pluck('id')->all();

        $partner->update([
            'default_shipping_address_id' => in_array((int) $defaultShippingId, $partnerAddressIds, true)
                ? $defaultShippingId
                : null,
            'default_billing_address_id' => in_array((int) $defaultBillingId, $partnerAddressIds, true)
                ? $defaultBillingId
                : null,
        ]);

        return redirect('/business-partners');
    }

    private function partner(Request $request): ?BusinessPartner
    {
        $id = $this->context($request, 'business_partner_id');

        if ($id === null || $id === '') {
            return null;
        }

        return BusinessPartner::query()->findOrFail($id);
    }
}
