<?php
declare(strict_types=1);

use Lattice\Lattice\Facades\Lattice;
use Workbench\App\Enums\SalesOrderStatus;
use Workbench\App\Forms\SalesOrderForm;
use Workbench\App\Models\Address;
use Workbench\App\Models\BusinessPartner;
use Workbench\App\Models\Group;
use Workbench\App\Models\Product;
use Workbench\App\Models\SalesOrder;
use Workbench\App\Models\SalesPrice;
use Workbench\App\Pricing\PriceResolver;

use function Pest\Laravel\get;
use function Pest\Laravel\withoutVite;

test('the sales order create page renders', function (): void {
    withoutVite();
    $this->actingAs(workbenchTestUser());

    get('/sales-orders/create')->assertOk();
});

test('the sales order form creates an order with snapshotted lines and partner default addresses', function (): void {
    Lattice::forms([SalesOrderForm::class]);

    $partner = BusinessPartner::factory()->create();
    $shipping = Address::factory()->create(['business_partner_id' => $partner->getKey()]);
    $billing = Address::factory()->create(['business_partner_id' => $partner->getKey()]);
    $partner->update([
        'default_shipping_address_id' => $shipping->getKey(),
        'default_billing_address_id' => $billing->getKey(),
    ]);

    $group = Group::factory()->create();
    $partner->groups()->attach($group);

    $deskLamp = Product::factory()->withoutDefaultPrice()->create(['name' => 'Desk Lamp']);
    SalesPrice::factory()->create(['product_id' => $deskLamp->getKey(), 'group_id' => null, 'amount' => '100.00']);

    $chair = Product::factory()->withoutDefaultPrice()->create(['name' => 'Office Chair']);
    SalesPrice::factory()->create(['product_id' => $chair->getKey(), 'group_id' => null, 'amount' => '250.00']);

    $this->submitForm(SalesOrderForm::class, [
        'business_partner_id' => (string) $partner->getKey(),
        'status' => SalesOrderStatus::Placed->value,
        'lines' => [
            ['id' => '', 'product_id' => (string) $deskLamp->getKey(), 'quantity' => '2', 'unit_price' => '100.00'],
            ['id' => '', 'product_id' => (string) $chair->getKey(), 'quantity' => '1', 'unit_price' => '250.00'],
        ],
    ])
        ->assertRedirect('/sales-orders');

    $order = SalesOrder::query()->where('business_partner_id', $partner->getKey())->firstOrFail();

    expect($order->status)->toBe(SalesOrderStatus::Placed)
        ->and($order->number)->toStartWith('SO-')
        ->and($order->shipping_address_id)->toBe($shipping->getKey())
        ->and($order->billing_address_id)->toBe($billing->getKey())
        ->and($order->lines()->count())->toBe(2);

    $deskLine = $order->lines()->where('product_id', $deskLamp->getKey())->firstOrFail();
    expect($deskLine->quantity)->toBe(2)
        ->and($deskLine->unit_price)->toBe('100.00');

    $chairLine = $order->lines()->where('product_id', $chair->getKey())->firstOrFail();
    expect($chairLine->quantity)->toBe(1)
        ->and($chairLine->unit_price)->toBe('250.00');

    $order->load('lines');
    expect($order->total())->toBe('450.00');
});

test('resolveUnitPrice returns the group-discounted price for a VIP partner', function (): void {
    $vipGroup = Group::factory()->create(['name' => 'VIP']);

    $vipPartner = BusinessPartner::factory()->create();
    $vipPartner->groups()->attach($vipGroup);

    $regularPartner = BusinessPartner::factory()->create();

    $product = Product::factory()->withoutDefaultPrice()->create(['name' => 'Premium Widget']);
    SalesPrice::factory()->create(['product_id' => $product->getKey(), 'group_id' => null, 'amount' => '100.00']);
    SalesPrice::factory()->create(['product_id' => $product->getKey(), 'group_id' => $vipGroup->getKey(), 'amount' => '80.00']);

    $form = new SalesOrderForm(app(PriceResolver::class));

    expect($form->resolveUnitPrice($product->getKey(), $vipPartner->getKey()))->toBe('80.00')
        ->and($form->resolveUnitPrice($product->getKey(), $regularPartner->getKey()))->toBe('100.00')
        ->and($form->resolveUnitPrice(null, $vipPartner->getKey()))->toBeNull()
        ->and($form->resolveUnitPrice($product->getKey(), null))->toBeNull();
});
