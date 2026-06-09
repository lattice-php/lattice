<?php

declare(strict_types=1);

namespace Workbench\App\Seeders;

use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;
use Illuminate\Foundation\Auth\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = $this->users();
        $password = Hash::make('password');

        User::query()->upsert(
            array_map(
                function (array $user, int $index) use ($password): array {
                    $createdAt = CarbonImmutable::parse('2025-01-01 09:00:00')->addMinutes($index);
                    $updatedAt = $createdAt->addMinutes($index + 1);

                    return [
                        'name' => $user['name'],
                        'email' => $user['email'],
                        'email_verified_at' => $updatedAt->toDateTimeString(),
                        'password' => $password,
                        'created_at' => $createdAt->toDateTimeString(),
                        'updated_at' => $updatedAt->toDateTimeString(),
                    ];
                },
                $users,
                array_keys($users),
            ),
            ['email'],
            ['name', 'email_verified_at', 'password', 'created_at', 'updated_at'],
        );
    }

    /**
     * @return array<int, array{name: string, email: string}>
     */
    private function users(): array
    {
        $faker = fake();
        $faker->seed(1337);
        $users = [
            ['name' => 'Ada Lovelace', 'email' => 'ada@example.com'],
            ['name' => 'Grace Hopper', 'email' => 'grace@example.com'],
            ['name' => 'Katherine Johnson', 'email' => 'katherine@example.com'],
            ['name' => 'Maya Chen', 'email' => 'maya@example.com'],
            ['name' => 'Linus Torvalds', 'email' => 'linus@example.com'],
            ['name' => 'Margaret Hamilton', 'email' => 'margaret@example.com'],
        ];

        for ($number = 1; $number <= 994; $number++) {
            $users[] = [
                'name' => $faker->name(),
                'email' => "workbench-user-{$number}@example.com",
            ];
        }

        return $users;
    }
}
