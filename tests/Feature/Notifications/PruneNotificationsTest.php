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

    $rows = $user->notifications()->orderBy('created_at')->get();
    DB::table('notifications')->where('id', $rows[0]->id)->update([
        'read_at' => now()->subDays(40), 'created_at' => now()->subDays(40),
    ]);
    DB::table('notifications')->where('id', $rows[1]->id)->update(['created_at' => now()->subDays(40)]);
    DB::table('notifications')->where('id', $rows[2]->id)->update(['read_at' => now()]);

    artisan('lattice:notifications:prune')->assertSuccessful();

    expect($user->notifications()->count())->toBe(2)
        ->and($user->notifications()->pluck('data')->pluck('title'))
        ->not->toContain('Old read');
});
