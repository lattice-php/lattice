<?php
declare(strict_types=1);

use Workbench\App\Models\BusinessPartner;
use Workbench\App\Models\Group;
use Workbench\App\Models\Product;
use Workbench\App\Models\SalesPrice;
use Workbench\App\Pricing\PriceResolver;

function priceProduct(): Product
{
    return Product::factory()->withoutDefaultPrice()->create();
}

test('falls back to the groupless default price', function (): void {
    $product = priceProduct();
    SalesPrice::factory()->create(['product_id' => $product->id, 'group_id' => null, 'amount' => 100]);
    $partner = BusinessPartner::factory()->create();

    expect(app(PriceResolver::class)->lowestFor($partner, $product))->toBe('100.00');
});

test('a group price the partner belongs to beats the default', function (): void {
    $product = priceProduct();
    $group = Group::factory()->create();
    SalesPrice::factory()->create(['product_id' => $product->id, 'group_id' => null, 'amount' => 100]);
    SalesPrice::factory()->create(['product_id' => $product->id, 'group_id' => $group->id, 'amount' => 80]);
    $partner = BusinessPartner::factory()->create();
    $partner->groups()->attach($group);

    expect(app(PriceResolver::class)->lowestFor($partner, $product))->toBe('80.00');
});

test('picks the lowest across multiple partner groups', function (): void {
    $product = priceProduct();
    $cheap = Group::factory()->create();
    $dear = Group::factory()->create();
    SalesPrice::factory()->create(['product_id' => $product->id, 'group_id' => $dear->id, 'amount' => 90]);
    SalesPrice::factory()->create(['product_id' => $product->id, 'group_id' => $cheap->id, 'amount' => 70]);
    $partner = BusinessPartner::factory()->create();
    $partner->groups()->attach([$cheap->id, $dear->id]);

    expect(app(PriceResolver::class)->lowestFor($partner, $product))->toBe('70.00');
});

test('ignores group prices the partner is not in', function (): void {
    $product = priceProduct();
    $other = Group::factory()->create();
    SalesPrice::factory()->create(['product_id' => $product->id, 'group_id' => null, 'amount' => 100]);
    SalesPrice::factory()->create(['product_id' => $product->id, 'group_id' => $other->id, 'amount' => 50]);
    $partner = BusinessPartner::factory()->create();

    expect(app(PriceResolver::class)->lowestFor($partner, $product))->toBe('100.00');
});

test('returns null when no price applies', function (): void {
    expect(app(PriceResolver::class)->lowestFor(BusinessPartner::factory()->create(), priceProduct()))->toBeNull();
});
