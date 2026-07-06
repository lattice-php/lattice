<?php
declare(strict_types=1);

namespace Lattice\Lattice\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Lattice\Lattice\Notifications\Support\ActionDescriptor;

final class NotificationController
{
    public function index(Request $request): JsonResponse
    {
        $notifiable = $request->user();
        $perPage = (int) config('lattice.notifications.per_page', 15);

        $notifications = $notifiable->notifications()->paginate($perPage);

        return response()->json([
            'notifications' => array_map($this->present(...), $notifications->items()),
            'unreadCount' => $notifiable->unreadNotifications()->count(),
            'hasMore' => $notifications->hasMorePages(),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function present(DatabaseNotification $notification): array
    {
        $data = $notification->getAttribute('data');

        return [
            'id' => $notification->getAttribute('id'),
            'title' => $data['title'] ?? $data['message'] ?? $data['subject'] ?? null,
            'body' => $data['body'] ?? (($data['title'] ?? null) ? ($data['message'] ?? null) : null),
            'icon' => $data['icon'] ?? null,
            'variant' => $data['variant'] ?? null,
            'href' => $data['href'] ?? null,
            'openInNewTab' => $data['openInNewTab'] ?? false,
            'isRead' => $notification->getAttribute('read_at') !== null,
            'createdAt' => $notification->getAttribute('created_at')?->toIso8601String(),
            'actions' => array_values(array_filter(array_map(
                ActionDescriptor::materialize(...),
                $data['actions'] ?? [],
            ))),
        ];
    }
}
