<?php
declare(strict_types=1);

use Lattice\Core\Support\Wire;
use Lattice\Notifications\Components\Notifications;

use function Pest\Laravel\actingAs;

test('the bell serializes its endpoint, channel and mode', function (): void {
    $user = workbenchTestUser();
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

test('the bell uses the configured browser route profile endpoint', function (): void {
    config()->set('lattice.notifications.component_route', 'browser');
    config()->set('lattice.notifications.routes', [
        'browser' => [
            'endpoint' => 'inbox/notifications',
        ],
    ]);

    $payload = wire(Notifications::make());

    expect($payload)->toHaveKey('props.endpoint', '/inbox/notifications');
});

describe('docs fixtures', function (): void {
    test('matches the bell example fixture', function (): void {
        assertFixtureMatches('notifications.bell', Wire::toWire([
            Notifications::make('notifications-bell'),
        ]));
    });
});
