<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Lattice\Lattice\Actions\ActionDefinition;
use Lattice\Lattice\Actions\ActionResult;
use Lattice\Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Lattice\Attributes\AsAction;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Notifications\Notification;
use Workbench\App\Actions\MarkNotificationSeenAction;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\getJson;

test('index returns the users notifications with an unread count', function (): void {
    $user = workbenchTestUser();
    Notification::make()->title('First')->send($user);
    $this->travel(1)->seconds();
    Notification::make()->title('Second')->send($user);

    actingAs($user);

    getJson('/lattice/notifications')
        ->assertOk()
        ->assertJsonPath('unreadCount', 2)
        ->assertJsonPath('notifications.0.title', 'Second')
        ->assertJsonPath('notifications.1.title', 'First')
        ->assertJsonPath('notifications.0.isRead', false);
});

test('index returns translatable titles and bodies as their wire shape', function (): void {
    $user = workbenchTestUser();
    Notification::make()
        ->title(rt('orders.shipped.title'))
        ->body(rt('orders.shipped.body')->with(['order' => 1234]))
        ->send($user);

    actingAs($user);

    getJson('/lattice/notifications')
        ->assertOk()
        ->assertJsonPath('notifications.0.title.key', 'orders.shipped.title')
        ->assertJsonPath('notifications.0.body.key', 'orders.shipped.body')
        ->assertJsonPath('notifications.0.body.replacements.order', 1234);
});

test('index never leaks another users notifications', function (): void {
    $me = workbenchTestUser();
    $other = workbenchTestUser();
    Notification::make()->title('Theirs')->send($other);

    actingAs($me);

    getJson('/lattice/notifications')
        ->assertOk()
        ->assertJsonPath('unreadCount', 0)
        ->assertJsonCount(0, 'notifications');
});

test('index materializes action descriptors into signed action nodes', function (): void {
    Lattice::actions([MarkNotificationSeenAction::class]);
    $user = workbenchTestUser();
    Notification::make()->title('Order shipped')
        ->action(MarkNotificationSeenAction::class, ['order' => 1234])
        ->link('Track', '/orders/1234/track')
        ->send($user);

    actingAs($user);

    getJson('/lattice/notifications')
        ->assertOk()
        ->assertJsonPath('notifications.0.actions.0.type', 'action')
        ->assertJsonPath('notifications.0.actions.1.type', 'link');
});

test('index omits an action descriptor whose action denies authorization', function (): void {
    Lattice::actions([NotificationIndexTestDeniedAction::class]);
    $user = workbenchTestUser();
    Notification::make()->title('Order shipped')
        ->action(NotificationIndexTestDeniedAction::class, ['order' => 1234])
        ->link('Track', '/orders/1234/track')
        ->send($user);

    actingAs($user);

    getJson('/lattice/notifications')
        ->assertOk()
        ->assertJsonCount(1, 'notifications.0.actions')
        ->assertJsonPath('notifications.0.actions.0.type', 'link');
});

test('index gracefully drops an action descriptor referencing an unregistered action', function (): void {
    $user = workbenchTestUser();
    Notification::make()->title('Order shipped')
        ->action('definitely-unregistered-action', ['order' => 1234])
        ->send($user);

    actingAs($user);

    getJson('/lattice/notifications')
        ->assertOk()
        ->assertJsonCount(0, 'notifications.0.actions');
});

test('index renders a legacy non-lattice notification row with a best-effort fallback', function (): void {
    $user = workbenchTestUser();
    $user->notifications()->create([
        'id' => (string) Str::uuid(),
        'type' => 'legacy-notification',
        'data' => ['message' => 'Legacy message'],
        'read_at' => null,
    ]);

    actingAs($user);

    getJson('/lattice/notifications')
        ->assertOk()
        ->assertJsonPath('notifications.0.title', 'Legacy message');
});

#[AsAction('notification-index-test.denied')]
final class NotificationIndexTestDeniedAction extends ActionDefinition
{
    public function definition(ActionComponent $action): ActionComponent
    {
        return $action->label('Denied');
    }

    public function handle(Request $request): ActionResult
    {
        return ActionResult::success();
    }

    #[Override]
    public function authorize(Request $request): bool
    {
        return false;
    }
}
