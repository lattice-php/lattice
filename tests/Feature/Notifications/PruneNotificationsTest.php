<?php
declare(strict_types=1);

use Illuminate\Support\Facades\DB;
use Lattice\Lattice\Notifications\Notification;

use function Pest\Laravel\artisan;

test('prune deletes only read notifications older than the cutoff', function (): void {
    config()->set('lattice.notifications.prune_after_days', 30);
    $user = workbenchTestUser();

    Notification::make()->title('Old read')->send($user);
    Notification::make()->title('Old unread')->send($user);
    Notification::make()->title('Recent read')->send($user);

    $notifications = $user->notifications()->get();
    $idFor = fn (string $title): string => $notifications
        ->sole(fn ($row): bool => $row->getAttribute('data')['title'] === $title)
        ->getAttribute('id');

    DB::table('notifications')->where('id', $idFor('Old read'))->update([
        'read_at' => now()->subDays(40), 'created_at' => now()->subDays(40),
    ]);
    DB::table('notifications')->where('id', $idFor('Old unread'))->update(['created_at' => now()->subDays(40)]);
    DB::table('notifications')->where('id', $idFor('Recent read'))->update(['read_at' => now()]);

    artisan('lattice:notifications:prune')->assertSuccessful();

    expect($user->notifications()->count())->toBe(2)
        ->and($user->notifications()->pluck('data')->pluck('title'))
        ->not->toContain('Old read');
});
