<?php
declare(strict_types=1);

use Illuminate\Support\Facades\Lang;
use Illuminate\Support\Facades\Route;
use Lattice\Notifications\Notification;
use Lattice\Notifications\NotificationRoutes;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\getJson;

test('configured route profiles expose the same notification API with their own presentation mode', function (): void {
    config()->set('lattice.notifications.routes', [
        'browser' => [
            'endpoint' => 'browser/notifications',
            'middleware' => ['web', 'auth'],
            'name' => 'browser.notifications',
        ],
        'mobile' => [
            'endpoint' => 'api/mobile-notifications',
            'middleware' => ['api', 'auth'],
            'name' => 'mobile.notifications',
            'translations' => 'resolved',
        ],
    ]);

    NotificationRoutes::register();
    Route::getRoutes()->refreshNameLookups();

    $indexRoute = Route::getRoutes()->getByName('mobile.notifications.index');
    expect($indexRoute)->not->toBeNull()
        ->and($indexRoute?->uri())->toBe('api/mobile-notifications')
        ->and($indexRoute?->gatherMiddleware())->toContain('api', 'auth')
        ->and(Route::getRoutes()->getByName('browser.notifications.index'))->not->toBeNull()
        ->and(Route::getRoutes()->getByName('mobile.notifications.show'))->not->toBeNull()
        ->and(Route::getRoutes()->getByName('mobile.notifications.unread-count'))->not->toBeNull();

    Lang::addLines([
        'orders.shipped.title' => 'Bestellung :order versandt',
        'orders.shipped.body' => 'Die Bestellung ist unterwegs.',
    ], 'de');

    $user = workbenchTestUser();
    $user->update(['locale' => 'de']);
    Notification::make()
        ->title(rt('orders:shipped.title')->with(['order' => 1234]))
        ->body(rt('orders:shipped.body'))
        ->send($user);

    actingAs($user);

    getJson('/api/mobile-notifications')
        ->assertOk()
        ->assertJsonPath('notifications.0.title', 'Bestellung 1234 versandt')
        ->assertJsonPath('notifications.0.body', 'Die Bestellung ist unterwegs.');
});
