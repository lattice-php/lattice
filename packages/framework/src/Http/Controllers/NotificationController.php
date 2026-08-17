<?php
declare(strict_types=1);

namespace Lattice\Http\Controllers;

use Illuminate\Contracts\Translation\HasLocalePreference;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Lattice\Notifications\NotificationItem;
use Lattice\Notifications\NotificationList;
use Lattice\Notifications\NotificationPresenter;
use Lattice\Notifications\NotificationRoutes;
use Lattice\Notifications\NotificationTranslationMode;
use Lattice\Notifications\UnreadCount;

final readonly class NotificationController
{
    public function __construct(private NotificationPresenter $presenter) {}

    public function index(Request $request): JsonResponse
    {
        $notifiable = $request->user();

        if ($notifiable === null) {
            abort(401);
        }

        $perPage = (int) config('lattice.notifications.per_page', 15);

        $notifications = $notifiable->notifications()->paginate($perPage);
        $translationMode = $this->translationMode($request);
        $locale = $this->locale($notifiable);

        return response()->json(new NotificationList(
            notifications: array_values(array_map(
                fn (DatabaseNotification $notification): NotificationItem => $this->presenter->present($notification, $translationMode, $locale),
                $notifications->items(),
            )),
            unreadCount: $notifiable->unreadNotifications()->count(),
            hasMore: $notifications->hasMorePages(),
        ));
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $notifiable = $request->user();

        if ($notifiable === null) {
            abort(401);
        }

        $notification = $notifiable->notifications()->findOrFail($id);

        return response()->json($this->presenter->present(
            $notification,
            $this->translationMode($request),
            $this->locale($notifiable),
        ));
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $notifiable = $request->user();

        if ($notifiable === null) {
            abort(401);
        }

        return $this->count($notifiable);
    }

    public function read(Request $request, string $id): JsonResponse
    {
        $notifiable = $request->user();

        if ($notifiable === null) {
            abort(401);
        }

        $notifiable->notifications()->findOrFail($id)->markAsRead();

        return $this->count($notifiable);
    }

    public function readAll(Request $request): JsonResponse
    {
        $notifiable = $request->user();

        if ($notifiable === null) {
            abort(401);
        }

        $notifiable->unreadNotifications()->update(['read_at' => now()]);

        return $this->count($notifiable);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $notifiable = $request->user();

        if ($notifiable === null) {
            abort(401);
        }

        $notifiable->notifications()->findOrFail($id)->delete();

        return $this->count($notifiable);
    }

    public function clear(Request $request): JsonResponse
    {
        $notifiable = $request->user();

        if ($notifiable === null) {
            abort(401);
        }

        $notifiable->notifications()->delete();

        return $this->count($notifiable);
    }

    private function count(mixed $notifiable): JsonResponse
    {
        return response()->json(new UnreadCount($notifiable->unreadNotifications()->count()));
    }

    private function translationMode(Request $request): NotificationTranslationMode
    {
        $translationMode = $request->route(NotificationRoutes::TranslationModeParameter);

        return is_string($translationMode)
            ? NotificationTranslationMode::tryFrom($translationMode) ?? NotificationTranslationMode::Wire
            : NotificationTranslationMode::Wire;
    }

    private function locale(mixed $notifiable): ?string
    {
        if (! $notifiable instanceof HasLocalePreference) {
            return null;
        }

        $locale = $notifiable->preferredLocale();

        return is_string($locale) && $locale !== '' ? $locale : null;
    }
}
