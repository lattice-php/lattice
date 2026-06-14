<?php
declare(strict_types=1);

namespace Workbench\App\Pricing;

use Illuminate\Database\Eloquent\Builder;
use Workbench\App\Models\BusinessPartner;
use Workbench\App\Models\Product;

final class PriceResolver
{
    public function lowestFor(BusinessPartner $partner, Product $product): ?string
    {
        $groupIds = $partner->groups()->pluck('groups.id')->all();

        $amount = $product->salesPrices()
            ->where(function (Builder $query) use ($groupIds): void {
                $query->whereNull('group_id');

                if ($groupIds !== []) {
                    $query->orWhereIn('group_id', $groupIds);
                }
            })
            ->min('amount');

        return $amount === null ? null : number_format((float) $amount, 2, '.', '');
    }

    /**
     * @return array<int, array{product: Product, price: string|null}>
     */
    public function priceList(BusinessPartner $partner): array
    {
        return Product::query()->orderBy('name')->get()
            ->map(fn (Product $product): array => [
                'product' => $product,
                'price' => $this->lowestFor($partner, $product),
            ])
            ->all();
    }
}
