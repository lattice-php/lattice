<?php
declare(strict_types=1);

use Workbench\App\Models\BusinessPartner;
use Workbench\App\Models\Group;
use Workbench\App\Models\Product;

function vipPricedProduct(string $name, string $defaultAmount, Group $group, string $groupAmount): Product
{
    $product = Product::factory()->withoutDefaultPrice()->create(['name' => $name]);
    $product->salesPrices()->create(['group_id' => null, 'amount' => $defaultAmount]);
    $product->salesPrices()->create(['group_id' => $group->getKey(), 'amount' => $groupAmount]);

    return $product;
}

it('auto-resolves, re-resolves on partner change, and persists a manual override', function (): void {
    $this->actingAs(workbenchTestUser());

    $vipGroup = Group::factory()->create(['name' => 'VIP Group']);

    $regularPartner = BusinessPartner::factory()->create(['name' => 'Regular Partner']);
    $vipPartner = BusinessPartner::factory()->create(['name' => 'VIP Partner']);
    $vipPartner->groups()->attach($vipGroup);

    vipPricedProduct('Standard Desk', '100.00', $vipGroup, '80.00');

    visit('/sales-orders/create')
        ->assertSee('Create sales order')
        ->click('[data-test="select-business_partner_id"]')
        ->fill('[data-test="select-business_partner_id-search"]', 'Regular')
        ->click('Regular Partner')
        ->click('[data-test="repeater-lines-row-0"] [data-test="select-product_id"]')
        ->fill('[data-test="select-product_id-search"]', 'Standard')
        ->click('Standard Desk')
        ->wait(1)
        ->assertValue('input[name="lines[0][unit_price]"]', '100.00')
        ->click('[data-test="select-business_partner_id"]')
        ->fill('[data-test="select-business_partner_id-search"]', 'VIP')
        ->click('VIP Partner')
        ->wait(1)
        ->assertValue('input[name="lines[0][unit_price]"]', '80.00')
        ->fill('input[name="lines[0][quantity]"]', '2')
        ->fill('input[name="lines[0][unit_price]"]', '73.50')
        ->click('@form-submit')
        ->assertSee('Sales orders')
        ->assertNoSmoke()
        ->assertNoJavaScriptErrors();

    $line = $vipPartner->salesOrders()->firstOrFail()->lines()->firstOrFail();

    expect($line->unit_price)->toBe('73.50')
        ->and($line->quantity)->toBe(2);
});
