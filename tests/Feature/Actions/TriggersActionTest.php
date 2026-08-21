<?php
declare(strict_types=1);

use Lattice\Core\Facades\Lattice;
use Lattice\Facades\Effects;
use Lattice\Tests\Fixtures\Workbench\WorkbenchPingAction;
use Lattice\Ui\Components\Button;
use Lattice\Ui\Components\Link;
use Lattice\Ui\Components\MenuItem;

use function Pest\Laravel\postJson;

beforeEach(function (): void {
    Lattice::actions([WorkbenchPingAction::class]);
});

dataset('action triggers', [
    'menu item' => [MenuItem::class, 'menu-item'],
    'link' => [Link::class, 'link'],
    'button' => [Button::class, 'button'],
]);

test('a trigger bound to an action serializes a nested action node sealed to its endpoint', function (string $class, string $type): void {
    $wire = wire($class::make('Ping', 'ping')->action(WorkbenchPingAction::class));

    expect($wire['type'])->toBe($type)
        ->and($wire['props']['href'])->toBeNull()
        ->and($wire['props']['action']['type'])->toBe('action')
        ->and($wire['props']['action']['props']['endpoint'])->toBe('/lattice/actions/workbench.ping')
        ->and($wire['props']['action']['props']['ref'])->not->toBe('');
})->with('action triggers');

test('the nested action node of a trigger dispatches through the action endpoint', function (string $class): void {
    $action = wire($class::make('Ping', 'ping')->action(WorkbenchPingAction::class))['props']['action'];

    postJson($action['props']['endpoint'], ['name' => 'Taylor'], $this->latticeHeaders($action['props']['ref']))
        ->assertOk()
        ->assertJsonPath('data.handled', 'Taylor')
        ->assertJsonPath('effects.0.type', 'toast');
})->with('action triggers');

test('a trigger cannot combine an action and an href in either order', function (string $class): void {
    expect(fn () => $class::make('Log out', 'log-out')->href('/logout')->action(WorkbenchPingAction::class))
        ->toThrow(InvalidArgumentException::class)
        ->and(fn () => $class::make('Log out', 'log-out')->action(WorkbenchPingAction::class)->href('/logout'))
        ->toThrow(InvalidArgumentException::class);
})->with([
    'menu item' => [MenuItem::class],
    'link' => [Link::class],
]);

test('a menu item cannot bind an action when it has children', function (): void {
    MenuItem::make('Account', 'account')
        ->children([MenuItem::make('Profile', 'profile')->href('/profile')])
        ->action(WorkbenchPingAction::class);
})->throws(InvalidArgumentException::class);

test('an action menu item cannot gain children', function (): void {
    MenuItem::make('Log out', 'log-out')
        ->action(WorkbenchPingAction::class)
        ->children([MenuItem::make('Profile', 'profile')->href('/profile')]);
})->throws(InvalidArgumentException::class);

test('a link bound to effects serializes them without an href or action', function (): void {
    $wire = wire(Link::make('Collapse', 'collapse')->effects(Effects::toggleSidebar('app-sidebar')));

    expect($wire['type'])->toBe('link')
        ->and($wire['props']['href'])->toBeNull()
        ->and($wire['props']['action'])->toBeNull()
        ->and($wire['props']['effects'][0]['type'])->toBe('toggle-sidebar');
});

test('a button cannot bind both effects and an action', function (): void {
    Button::make('Collapse', 'collapse')
        ->effects(Effects::toggleSidebar('app-sidebar'))
        ->action(WorkbenchPingAction::class);
})->throws(InvalidArgumentException::class);

test('a link cannot set an href after binding effects', function (): void {
    Link::make('Collapse', 'collapse')
        ->effects(Effects::toggleSidebar('app-sidebar'))
        ->href('/logout');
})->throws(InvalidArgumentException::class);
