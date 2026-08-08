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
        return $this->lowest($this->groupIdsFor($partner), $product);
    }

    /**
     * @return array<int, array{product: Product, price: string|null}>
     */
    public function priceList(BusinessPartner $partner): array
    {
        $groupIds = $this->groupIdsFor($partner);

        return Product::query()->orderBy('name')->get()
            ->map(fn (Product $product): array => [
                'product' => $product,
                'price' => $this->lowest($groupIds, $product),
            ])
            ->all();
    }

    /**
     * @return list<int>
     */
    private function groupIdsFor(BusinessPartner $partner): array
    {
        return array_values($partner->groups()->pluck('groups.id')->map(fn (mixed $id): int => (int) $id)->all());
    }

    /**
     * @param  list<int>  $groupIds
     */
    private function lowest(array $groupIds, Product $product): ?string
    {
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
}
