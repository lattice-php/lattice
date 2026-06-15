<?php
declare(strict_types=1);

namespace Workbench\App\Seeders;

use Bambamboole\ExtendedFaker\Dto\ProductDto;
use Carbon\CarbonImmutable;
use Faker\Generator;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Workbench\App\Enums\SalesOrderStatus;
use Workbench\App\Models\Address;
use Workbench\App\Models\BusinessPartner;
use Workbench\App\Models\File;
use Workbench\App\Models\Group;
use Workbench\App\Models\Product;
use Workbench\App\Models\SalesOrder;
use Workbench\App\Models\SalesOrderLine;
use Workbench\App\Models\SalesPrice;
use Workbench\App\Models\User;
use Workbench\App\Pricing\PriceResolver;

use function Orchestra\Testbench\package_path;

class DatabaseSeeder extends Seeder
{
    public function __construct(private readonly PriceResolver $priceResolver) {}

    public function run(): void
    {
        $this->seedUsers();
        $products = $this->seedProducts();
        $groups = $this->seedGroups();
        $partners = $this->seedBusinessPartners($groups);

        $this->seedSalesPrices($products, $groups);
        $this->seedSalesOrders($partners, $products);
    }

    private function seedUsers(): void
    {
        $users = $this->users($this->nextUserBatchNumber());
        $password = Hash::make('password');

        User::query()->insert(array_map(
            function (array $user, int $index) use ($password): array {
                $createdAt = CarbonImmutable::parse('2025-01-01 09:00:00')->addMinutes($index);
                $updatedAt = $createdAt->addMinutes($index + 1);

                return [
                    'name' => $user['name'],
                    'email' => $user['email'],
                    'email_verified_at' => $updatedAt->toDateTimeString(),
                    'password' => $password,
                    'locale' => $user['locale'] ?? 'en',
                    'created_at' => $createdAt->toDateTimeString(),
                    'updated_at' => $updatedAt->toDateTimeString(),
                ];
            },
            $users,
            array_keys($users),
        ));
    }

    /**
     * @return array<int, array{name: string, email: string, locale?: string}>
     */
    private function users(int $batch): array
    {
        $faker = fake();
        $faker->seed(1337);
        $users = [
            ['name' => 'Workbench User', 'email' => $this->userEmail('workbench', $batch), 'locale' => 'en'],
            ['name' => 'Ada Lovelace', 'email' => $this->userEmail('ada', $batch)],
            ['name' => 'Grace Hopper', 'email' => $this->userEmail('grace', $batch)],
            ['name' => 'Katherine Johnson', 'email' => $this->userEmail('katherine', $batch)],
            ['name' => 'Maya Chen', 'email' => $this->userEmail('maya', $batch)],
            ['name' => 'Linus Torvalds', 'email' => $this->userEmail('linus', $batch)],
            ['name' => 'Margaret Hamilton', 'email' => $this->userEmail('margaret', $batch)],
        ];

        for ($number = 1; $number <= 994; $number++) {
            $users[] = [
                'name' => $faker->name(),
                'email' => $this->userEmail(sprintf('workbench-user-%03d', $number), $batch),
            ];
        }

        return $users;
    }

    private function userEmail(string $localPart, int $batch): string
    {
        return $batch === 1
            ? "{$localPart}@example.com"
            : "{$localPart}-run-{$batch}@example.com";
    }

    private function nextUserBatchNumber(): int
    {
        if (! User::query()->where('email', 'workbench@example.com')->exists()) {
            return 1;
        }

        $lastBatch = User::query()
            ->where('email', 'like', 'workbench-run-%@example.com')
            ->pluck('email')
            ->map(static function (string $email): int {
                preg_match('/^workbench-run-(\d+)@example\.com$/', $email, $matches);

                return (int) ($matches[1] ?? 0);
            })
            ->max();

        return max(2, ((int) $lastBatch) + 1);
    }

    /**
     * @return array<int, Product>
     */
    private function seedProducts(): array
    {
        $products = $this->products($this->nextProductNumber());
        $models = $this->createProducts($products);

        $this->seedImages($products, $models);
        $this->seedProductRelations($models);

        return array_values($models);
    }

    /**
     * @param  array<string, Product>  $products
     */
    private function seedProductRelations(array $products): void
    {
        $ids = array_map(
            static fn (Product $product): int => (int) $product->getKey(),
            array_values($products),
        );

        foreach (array_slice($ids, 0, 20, true) as $index => $id) {
            Product::query()->find($id)?->relatedProducts()->attach(array_values(array_filter([
                $ids[$index + 1] ?? null,
                $ids[$index + 2] ?? null,
            ])));
        }
    }

    /**
     * @return array<int, array{name: string, sku: string, image: string, status: string, featured: bool, created_at: string, updated_at: string}>
     */
    private function products(int $startAt): array
    {
        $faker = fake();
        $faker->seed(20260608);
        $statuses = ['draft', 'active', 'archived'];
        $createdAt = CarbonImmutable::now()->subYear();

        return array_map(
            function (int $offset) use ($faker, $startAt, $statuses, $createdAt): array {
                $number = $startAt + $offset;
                $product = $this->fakeProduct($faker);

                return [
                    'name' => $product->name,
                    'sku' => sprintf('workbench-product-%03d', $number),
                    'image' => $product->image,
                    'status' => $statuses[($number - 1) % count($statuses)],
                    'featured' => $faker->boolean(),
                    'created_at' => $createdAt->toDateTimeString(),
                    'updated_at' => CarbonImmutable::parse(
                        $faker->dateTimeBetween($createdAt, 'now'),
                    )->toDateTimeString(),
                ];
            },
            range(0, 99),
        );
    }

    private function fakeProduct(Generator $faker): ProductDto
    {
        $product = $faker->format('product');

        if (! $product instanceof ProductDto) {
            throw new RuntimeException('Extended Faker product must return a product DTO.');
        }

        return $product;
    }

    /**
     * @param  array<int, array{name: string, sku: string, image: string, status: string, featured: bool, created_at: string, updated_at: string}>  $products
     * @return array<string, Product>
     */
    private function createProducts(array $products): array
    {
        $models = [];

        foreach ($products as $product) {
            $models[$product['sku']] = Product::unguarded(
                static fn (): Product => Product::query()->create(array_diff_key($product, ['image' => true])),
            );
        }

        return $models;
    }

    /**
     * @param  array<int, array{name: string, sku: string, image: string, status: string, featured: bool, created_at: string, updated_at: string}>  $products
     * @param  array<string, Product>  $models
     */
    private function seedImages(array $products, array $models): void
    {
        foreach ($products as $product) {
            $model = $models[$product['sku']] ?? null;

            if (! $model instanceof Product || $product['image'] === '') {
                continue;
            }

            $file = $this->createFile($model, $product['image']);

            $model->images()->attach([
                $file->getKey() => ['sort_order' => 1],
            ]);
        }
    }

    private function createFile(Product $product, string $image): File
    {
        $source = package_path('vendor/bambamboole/extended-faker/resources/'.$image);
        $contents = file_get_contents($source);

        if ($contents === false) {
            throw new RuntimeException("Unable to read product image fixture [{$image}].");
        }

        $path = 'workbench/products/'.$product->sku.'-'.basename($image);

        Storage::disk('s3')->put($path, $contents, 'public');

        return File::query()->create([
            'disk' => 's3',
            'path' => $path,
            'name' => basename($path),
            'mime_type' => 'image/webp',
            'size' => strlen($contents),
        ]);
    }

    private function nextProductNumber(): int
    {
        $lastNumber = Product::query()
            ->where('sku', 'like', 'workbench-product-%')
            ->pluck('sku')
            ->map(static function (string $sku): int {
                preg_match('/^workbench-product-(\d+)$/', $sku, $matches);

                return (int) ($matches[1] ?? 0);
            })
            ->max();

        return ((int) $lastNumber) + 1;
    }

    /**
     * @return array{retail: Group, wholesale: Group, vip: Group}
     */
    private function seedGroups(): array
    {
        return [
            'retail' => Group::query()->create(['name' => 'Retail']),
            'wholesale' => Group::query()->create(['name' => 'Wholesale']),
            'vip' => Group::query()->create(['name' => 'VIP']),
        ];
    }

    /**
     * @param  array{retail: Group, wholesale: Group, vip: Group}  $groups
     * @return array<int, BusinessPartner>
     */
    private function seedBusinessPartners(array $groups): array
    {
        $partners = [
            [
                'name' => 'Acme Corporation',
                'email' => 'contact@acme.example.com',
                'groups' => [$groups['retail']->getKey()],
            ],
            [
                'name' => 'Global Trade GmbH',
                'email' => 'info@globaltrade.example.com',
                'groups' => [$groups['wholesale']->getKey(), $groups['retail']->getKey()],
            ],
            [
                'name' => 'Elite Partners Ltd',
                'email' => 'hello@elitepartners.example.com',
                'groups' => [$groups['vip']->getKey(), $groups['wholesale']->getKey()],
            ],
        ];
        $models = [];

        foreach ($partners as $data) {
            $partner = BusinessPartner::query()->create([
                'name' => $data['name'],
                'email' => $data['email'],
            ]);

            $partner->groups()->attach($data['groups']);

            $shipping = Address::factory()->create([
                'business_partner_id' => $partner->getKey(),
                'label' => 'HQ',
            ]);
            $billing = Address::factory()->create([
                'business_partner_id' => $partner->getKey(),
                'label' => 'Billing',
            ]);

            $partner->update([
                'default_shipping_address_id' => $shipping->getKey(),
                'default_billing_address_id' => $billing->getKey(),
            ]);

            $models[] = $partner;
        }

        return $models;
    }

    /**
     * @param  array<int, Product>  $products
     * @param  array{retail: Group, wholesale: Group, vip: Group}  $groups
     */
    private function seedSalesPrices(array $products, array $groups): void
    {
        $faker = fake();
        $faker->seed(20260608);

        foreach ($products as $product) {
            $base = $faker->randomFloat(2, 20, 500);

            SalesPrice::query()->create([
                'product_id' => $product->getKey(),
                'group_id' => null,
                'amount' => number_format($base, 2, '.', ''),
            ]);
            SalesPrice::query()->create([
                'product_id' => $product->getKey(),
                'group_id' => $groups['wholesale']->getKey(),
                'amount' => number_format($base * 0.85, 2, '.', ''),
            ]);
            SalesPrice::query()->create([
                'product_id' => $product->getKey(),
                'group_id' => $groups['vip']->getKey(),
                'amount' => number_format($base * 0.70, 2, '.', ''),
            ]);
        }
    }

    /**
     * @param  array<int, BusinessPartner>  $partners
     * @param  array<int, Product>  $products
     */
    private function seedSalesOrders(array $partners, array $products): void
    {
        $partner = $partners[0] ?? null;

        if (! $partner instanceof BusinessPartner) {
            return;
        }

        $nextOrderNumber = $this->nextSalesOrderNumber();

        for ($i = 0; $i < 2; $i++) {
            $order = SalesOrder::query()->create([
                'business_partner_id' => $partner->getKey(),
                'number' => sprintf('SO-%04d', $nextOrderNumber + $i),
                'status' => SalesOrderStatus::Draft,
                'shipping_address_id' => $partner->default_shipping_address_id,
                'billing_address_id' => $partner->default_billing_address_id,
            ]);

            foreach (array_slice($products, 0, 2) as $product) {
                $price = $this->priceResolver->lowestFor($partner, $product);

                if ($price === null) {
                    continue;
                }

                SalesOrderLine::query()->create([
                    'sales_order_id' => $order->getKey(),
                    'product_id' => $product->getKey(),
                    'quantity' => fake()->numberBetween(1, 5),
                    'unit_price' => $price,
                ]);
            }
        }
    }

    private function nextSalesOrderNumber(): int
    {
        $lastNumber = SalesOrder::query()
            ->where('number', 'like', 'SO-%')
            ->pluck('number')
            ->map(static function (string $number): int {
                preg_match('/^SO-(\d+)$/', $number, $matches);

                return (int) ($matches[1] ?? 0);
            })
            ->max();

        return ((int) $lastNumber) + 1;
    }
}
