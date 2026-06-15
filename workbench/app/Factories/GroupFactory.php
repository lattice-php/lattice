<?php
declare(strict_types=1);

namespace Workbench\App\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Workbench\App\Models\BusinessPartner;
use Workbench\App\Models\Group;

/** @extends Factory<Group> */
class GroupFactory extends Factory
{
    protected $model = Group::class;

    /** @return array<string, mixed> */
    public function definition(): array
    {
        return ['name' => fake()->unique()->words(2, true)];
    }

    public function withCustomers(int $count): static
    {
        return $this->afterCreating(function (Group $group) use ($count): void {
            $customers = BusinessPartner::factory()
                ->withAddresses()
                ->count($count)
                ->create();

            foreach ($customers as $customer) {
                $customer->groups()->attach($group->getKey());
            }
        });
    }
}
