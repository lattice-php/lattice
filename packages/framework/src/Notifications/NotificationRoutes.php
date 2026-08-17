<?php
declare(strict_types=1);

namespace Lattice\Notifications;

use Illuminate\Routing\Route as LaravelRoute;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use InvalidArgumentException;
use Lattice\Http\Controllers\NotificationController;

final class NotificationRoutes
{
    public const string TranslationModeParameter = '_lattice_notification_translation_mode';

    public static function register(): void
    {
        foreach (self::profiles() as $name => $profile) {
            self::registerProfile($name, $profile);
        }
    }

    public static function componentEndpoint(): string
    {
        $profileName = config('lattice.notifications.component_route') ?? 'web';
        $profiles = config('lattice.notifications.routes');

        if (is_string($profileName) && is_array($profiles)) {
            $profile = $profiles[$profileName] ?? null;
            $endpoint = is_array($profile) ? ($profile['endpoint'] ?? null) : null;

            if (is_string($endpoint) && $endpoint !== '') {
                return $endpoint;
            }
        }

        return (string) config('lattice.notifications.endpoint', 'lattice/notifications');
    }

    /**
     * @return array<string, array<string, mixed>>
     */
    private static function profiles(): array
    {
        $configured = config('lattice.notifications.routes');

        if (! is_array($configured) || $configured === []) {
            return [
                'web' => [
                    'endpoint' => config('lattice.notifications.endpoint', 'lattice/notifications'),
                    'middleware' => config('lattice.notifications.middleware', ['web', 'auth']),
                    'name' => 'lattice.notifications.',
                    'translations' => NotificationTranslationMode::Wire->value,
                ],
            ];
        }

        $profiles = [];

        foreach ($configured as $name => $profile) {
            if (! is_string($name) || ! is_array($profile)) {
                throw new InvalidArgumentException('Lattice notification route profiles must be named configuration arrays.');
            }

            $profiles[$name] = $profile;
        }

        return $profiles;
    }

    /**
     * @param  array<string, mixed>  $profile
     */
    private static function registerProfile(string $name, array $profile): void
    {
        $endpoint = self::requiredString($profile['endpoint'] ?? null, "notifications.routes.{$name}.endpoint");
        $middleware = self::middleware($profile['middleware'] ?? ['web', 'auth']);
        $routeName = Str::finish(self::requiredString(
            $profile['name'] ?? "lattice.notifications.{$name}",
            "notifications.routes.{$name}.name",
        ), '.');
        $translationMode = self::translationMode($profile['translations'] ?? NotificationTranslationMode::Wire->value, $name);

        Route::middleware($middleware)
            ->prefix($endpoint)
            ->name($routeName)
            ->group(function () use ($translationMode): void {
                self::withTranslationMode(
                    Route::get('/', [NotificationController::class, 'index'])->name('index'),
                    $translationMode,
                );
                self::withTranslationMode(
                    Route::get('unread-count', [NotificationController::class, 'unreadCount'])->name('unread-count'),
                    $translationMode,
                );
                self::withTranslationMode(
                    Route::post('read-all', [NotificationController::class, 'readAll'])->name('read-all'),
                    $translationMode,
                );
                self::withTranslationMode(
                    Route::get('{id}', [NotificationController::class, 'show'])->name('show'),
                    $translationMode,
                );
                self::withTranslationMode(
                    Route::patch('{id}/read', [NotificationController::class, 'read'])->name('read'),
                    $translationMode,
                );
                self::withTranslationMode(
                    Route::delete('{id}', [NotificationController::class, 'destroy'])->name('destroy'),
                    $translationMode,
                );
                self::withTranslationMode(
                    Route::delete('/', [NotificationController::class, 'clear'])->name('clear'),
                    $translationMode,
                );
            });
    }

    private static function withTranslationMode(LaravelRoute $route, NotificationTranslationMode $translationMode): void
    {
        $route->defaults(self::TranslationModeParameter, $translationMode->value);
    }

    private static function requiredString(mixed $value, string $key): string
    {
        if (! is_string($value) || $value === '') {
            throw new InvalidArgumentException("Lattice [{$key}] must be a non-empty string.");
        }

        return $value;
    }

    /**
     * @return list<string>
     */
    private static function middleware(mixed $middleware): array
    {
        if (! is_array($middleware)) {
            throw new InvalidArgumentException('Lattice notification route middleware must be an array.');
        }

        foreach ($middleware as $value) {
            if (! is_string($value)) {
                throw new InvalidArgumentException('Lattice notification route middleware entries must be strings.');
            }
        }

        return array_values($middleware);
    }

    private static function translationMode(mixed $value, string $name): NotificationTranslationMode
    {
        $translationMode = is_string($value) ? NotificationTranslationMode::tryFrom($value) : null;

        if ($translationMode === null) {
            throw new InvalidArgumentException("Lattice notification route profile [{$name}] has an invalid translation mode.");
        }

        return $translationMode;
    }
}
