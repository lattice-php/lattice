<?php
declare(strict_types=1);

namespace Workbench\App\Forms;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Lattice\Lattice\Attributes\AsForm;
use Lattice\Lattice\Core\Components\Card;
use Lattice\Lattice\Core\EloquentOptions;
use Lattice\Lattice\Core\Option;
use Lattice\Lattice\Forms\Components\Choice;
use Lattice\Lattice\Forms\Components\Form as FormComponent;
use Lattice\Lattice\Forms\Components\HiddenInput;
use Lattice\Lattice\Forms\Components\Repeater;
use Lattice\Lattice\Forms\Components\Select;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Forms\FormData;
use Lattice\Lattice\Forms\FormDefinition;
use Symfony\Component\HttpFoundation\Response;
use Workbench\App\Enums\SalesOrderStatus;
use Workbench\App\Models\Address;
use Workbench\App\Models\BusinessPartner;
use Workbench\App\Models\Product;
use Workbench\App\Models\SalesOrder;
use Workbench\App\Pricing\PriceResolver;

#[AsForm('workbench.sales-orders.form')]
class SalesOrderForm extends FormDefinition
{
    public function __construct(private readonly PriceResolver $priceResolver) {}

    public function definition(FormComponent $form, Request $request): FormComponent
    {
        $order = $this->order();

        $schema = [
            Card::make(__('workbench.commerce.sales-orders.form.details-card'))->schema([
                Select::make('business_partner_id', __('workbench.commerce.sales-orders.fields.business-partner'))
                    ->optionsFrom(
                        EloquentOptions::make(BusinessPartner::class)->label('name')->limit(50),
                    )
                    ->rules(['required']),
                Choice::make('status', __('workbench.commerce.sales-orders.fields.status'))
                    ->options([
                        Choice::option(__('workbench.commerce.sales-orders.status.draft'), SalesOrderStatus::Draft->value),
                        Choice::option(__('workbench.commerce.sales-orders.status.placed'), SalesOrderStatus::Placed->value),
                        Choice::option(__('workbench.commerce.sales-orders.status.cancelled'), SalesOrderStatus::Cancelled->value),
                    ])
                    ->value(SalesOrderStatus::Draft->value, editable: true)
                    ->rules(['required', Rule::enum(SalesOrderStatus::class)]),
            ]),
        ];

        if ($order instanceof SalesOrder) {
            $addressOptions = $this->addressOptions($order->businessPartner);

            if ($addressOptions !== []) {
                $schema[] = Card::make(__('workbench.commerce.sales-orders.form.addresses-card'))->schema([
                    Select::make('shipping_address_id', __('workbench.commerce.sales-orders.fields.shipping-address'))
                        ->options($addressOptions)
                        ->rules(['nullable']),
                    Select::make('billing_address_id', __('workbench.commerce.sales-orders.fields.billing-address'))
                        ->options($addressOptions)
                        ->rules(['nullable']),
                ]);
            }
        }

        $schema[] = Card::make(__('workbench.commerce.sales-orders.form.lines-card'))->schema([
            Repeater::make('lines', __('workbench.commerce.sales-orders.fields.lines'))
                ->schema([
                    HiddenInput::make('id')->rules(['nullable']),
                    Select::make('product_id', __('workbench.commerce.sales-orders.fields.product'))
                        ->optionsFrom(
                            EloquentOptions::make(Product::class)->label('name')->limit(20),
                        )
                        ->rules(['required']),
                    TextInput::make('quantity', __('workbench.commerce.sales-orders.fields.quantity'))
                        ->rules(['required', 'numeric', 'min:1']),
                    TextInput::make('unit_price', __('workbench.commerce.sales-orders.fields.unit-price'))
                        ->rules(['required', 'numeric', 'min:0'])
                        ->value(
                            fn (FormData $row, FormData $form): ?string => $this->resolveUnitPrice($row->get('product_id'), $form->get('business_partner_id')),
                            editable: true,
                            resetOn: ['product_id'],
                            refreshOn: ['@business_partner_id'],
                        ),
                ])
                ->minItems(1)
                ->addLabel(__('workbench.commerce.sales-orders.fields.add-line')),
        ]);

        return $form->schema($schema);
    }

    public function handle(Request $request): Response
    {
        $order = $this->order();
        $validated = $this->validate($request);

        $lineRows = $validated['lines'] ?? [];

        $partner = BusinessPartner::query()->findOrFail($validated['business_partner_id']);

        DB::transaction(function () use ($order, $validated, $lineRows, $partner): void {
            $shippingAddressId = array_key_exists('shipping_address_id', $validated)
                ? $this->resolveAddressId($partner, $validated['shipping_address_id'] ?? null)
                : $partner->default_shipping_address_id;

            $billingAddressId = array_key_exists('billing_address_id', $validated)
                ? $this->resolveAddressId($partner, $validated['billing_address_id'] ?? null)
                : $partner->default_billing_address_id;

            $orderData = [
                'business_partner_id' => $partner->getKey(),
                'status' => $validated['status'],
                'shipping_address_id' => $shippingAddressId,
                'billing_address_id' => $billingAddressId,
            ];

            if (! $order instanceof SalesOrder) {
                $orderData['number'] = $this->generateNumber();
                $order = SalesOrder::query()->create($orderData);
            } else {
                $order->update($orderData);
            }

            $order->lines()->delete();

            foreach ($lineRows as $row) {
                $order->lines()->create([
                    'product_id' => (int) $row['product_id'],
                    'quantity' => (int) $row['quantity'],
                    'unit_price' => $row['unit_price'],
                ]);
            }
        });

        return redirect('/sales-orders');
    }

    public function resolveUnitPrice(mixed $productId, mixed $partnerId): ?string
    {
        if (blank($productId) || blank($partnerId)) {
            return null;
        }

        $partner = BusinessPartner::find($partnerId);
        $product = Product::find($productId);

        if ($partner === null || $product === null) {
            return null;
        }

        return $this->priceResolver->lowestFor($partner, $product);
    }

    /**
     * @return array<int, Option>
     */
    private function addressOptions(?BusinessPartner $partner): array
    {
        if (! $partner instanceof BusinessPartner) {
            return [];
        }

        return $partner->addresses()->get()->map(
            fn (Address $address): Option => Select::option(
                $address->displayLabel(),
                (string) $address->getKey(),
            ),
        )->all();
    }

    private function resolveAddressId(BusinessPartner $partner, mixed $addressId): ?int
    {
        if ($addressId === null || $addressId === '') {
            return null;
        }

        $addressId = (int) $addressId;

        return in_array($addressId, $partner->addresses()->pluck('id')->all(), true)
            ? $addressId
            : null;
    }

    private function generateNumber(): string
    {
        $next = ((int) SalesOrder::query()->max('id')) + 1;

        while (SalesOrder::query()->where('number', $this->formatNumber($next))->exists()) {
            $next++;
        }

        return $this->formatNumber($next);
    }

    private function formatNumber(int $sequence): string
    {
        return 'SO-'.str_pad((string) $sequence, 4, '0', STR_PAD_LEFT);
    }

    private function order(): ?SalesOrder
    {
        $id = $this->context('sales_order_id');

        if ($id === null || $id === '') {
            return null;
        }

        return SalesOrder::query()->findOrFail($id);
    }
}
