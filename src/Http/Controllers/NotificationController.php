<?php
declare(strict_types=1);

namespace Lattice\Lattice\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Lattice\Lattice\I18n\Values\Translatable;
use Lattice\Lattice\Notifications\NotificationItem;
use Lattice\Lattice\Notifications\NotificationList;
use Lattice\Lattice\Notifications\Support\ActionDescriptor;
use Lattice\Lattice\Notifications\UnreadCount;
use Lattice\Lattice\Ui\Enums\Variant;

final class NotificationController
{
    public function index(Request $request): JsonResponse
    {
        $notifiable = $request->user();
        $perPage = (int) config('lattice.notifications.per_page', 15);

        $notifications = $notifiable->notifications()->paginate($perPage);

        return response()->json(new NotificationList(
            notifications: array_map($this->present(...), $notifications->items()),
            unreadCount: $notifiable->unreadNotifications()->count(),
            hasMore: $notifications->hasMorePages(),
        ));
    }

    public function read(Request $request, string $id): JsonResponse
    {
        $notifiable = $request->user();
        $notifiable->notifications()->findOrFail($id)->markAsRead();

        return $this->count($notifiable);
    }

    public function readAll(Request $request): JsonResponse
    {
        $notifiable = $request->user();
        $notifiable->unreadNotifications()->update(['read_at' => now()]);

        return $this->count($notifiable);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $notifiable = $request->user();
        $notifiable->notifications()->findOrFail($id)->delete();

        return $this->count($notifiable);
    }

    public function clear(Request $request): JsonResponse
    {
        $notifiable = $request->user();
        $notifiable->notifications()->delete();

        return $this->count($notifiable);
    }

    private function count(object $notifiable): JsonResponse
    {
        return response()->json(new UnreadCount($notifiable->unreadNotifications()->count()));
    }

    private function present(DatabaseNotification $notification): NotificationItem
    {
        $data = $notification->getAttribute('data');
        $variant = $data['variant'] ?? null;

        return new NotificationItem(
            id: $notification->getAttribute('id'),
            title: $this->text($data['title'] ?? $data['message'] ?? $data['subject'] ?? null),
            body: $this->text($data['body'] ?? (($data['title'] ?? null) ? ($data['message'] ?? null) : null)),
            icon: $data['icon'] ?? null,
            variant: is_string($variant) ? Variant::tryFrom($variant) : null,
            href: $data['href'] ?? null,
            isRead: $notification->getAttribute('read_at') !== null,
            createdAt: $notification->getAttribute('created_at')?->toIso8601String(),
            actions: array_values(array_filter(array_map(
                ActionDescriptor::materialize(...),
                $data['actions'] ?? [],
            ))),
        );
    }

    private function text(mixed $value): string|Translatable|null
    {
        return Translatable::tryFromWire($value) ?? (is_string($value) ? $value : null);
    }
}
