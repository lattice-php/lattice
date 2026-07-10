<?php
declare(strict_types=1);

use Lattice\Lattice\Notifications\Components\Notifications;
use Lattice\Lattice\Support\Wire;
use Workbench\App\Models\User;

use function Pest\Laravel\actingAs;

test('the bell serializes its endpoint, channel and mode', function (): void {
    $user = User::query()->forceCreate([
        'name' => 'Bell', 'email' => 'bell@example.com', 'password' => 'x',
    ]);
    actingAs($user);

    $payload = wire(Notifications::make()->slideOut());

    expect($payload)->toMatchArray([
        'type' => 'notifications',
        'props' => [
            'endpoint' => '/lattice/notifications',
            'channel' => 'Workbench.App.Models.User.'.$user->getKey(),
            'slideOut' => true,
            'pollingInterval' => null,
        ],
    ]);
});

test('the bell defaults to popover mode', function (): void {
    $user = User::query()->forceCreate([
        'name' => 'Bell', 'email' => 'bell2@example.com', 'password' => 'x',
    ]);
    actingAs($user);

    expect(wire(Notifications::make())['props']['slideOut'])->toBeFalse();
});

describe('docs fixtures', function (): void {
    it('matches the bell example fixture', function (): void {
        assertFixtureMatches('notifications.bell', sortFixtureKeys(stripFixtureRefs(Wire::toWire([
            Notifications::make('notifications-bell'),
        ]))));
    });
});
