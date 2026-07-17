<?php
declare(strict_types=1);

use Lattice\Lattice\Facades\Effects;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Layouts\Components\MenuItem;
use Lattice\Lattice\Tests\Fixtures\Workbench\WorkbenchPingAction;
use Lattice\Lattice\Ui\Components\Button;
use Lattice\Lattice\Ui\Components\Link;

use function Pest\Laravel\postJson;

beforeEach(function (): void {
    Lattice::actions([WorkbenchPingAction::class]);
});

test('a menu item bound to an action serializes a nested action node sealed to its endpoint', function (): void {
    $wire = wire(MenuItem::make('Log out', 'log-out')->action(WorkbenchPingAction::class));

    expect($wire['type'])->toBe('menu-item')
        ->and($wire['props']['href'])->toBeNull()
        ->and($wire['props']['action']['type'])->toBe('action')
        ->and($wire['props']['action']['props']['endpoint'])->toBe('/lattice/actions/workbench.ping')
        ->and($wire['props']['action']['props']['ref'])->not->toBe('');
});

test('a link bound to an action serializes a nested action node sealed to its endpoint', function (): void {
    $wire = wire(Link::make('Log out', 'log-out')->action(WorkbenchPingAction::class));

    expect($wire['type'])->toBe('link')
        ->and($wire['props']['href'])->toBeNull()
        ->and($wire['props']['action']['type'])->toBe('action')
        ->and($wire['props']['action']['props']['endpoint'])->toBe('/lattice/actions/workbench.ping')
        ->and($wire['props']['action']['props']['ref'])->not->toBe('');
});

test('the nested action node of a menu item dispatches through the action endpoint', function (): void {
    $wire = wire(MenuItem::make('Ping', 'ping')->action(WorkbenchPingAction::class));
    $action = $wire['props']['action'];

    postJson($action['props']['endpoint'], ['name' => 'Taylor'], latticeHeaders($action['props']['ref']))
        ->assertOk()
        ->assertJsonPath('data.handled', 'Taylor')
        ->assertJsonPath('effects.0.type', 'toast');
});

test('the nested action node of a link dispatches through the action endpoint', function (): void {
    $wire = wire(Link::make('Ping', 'ping')->action(WorkbenchPingAction::class));
    $action = $wire['props']['action'];

    postJson($action['props']['endpoint'], ['name' => 'Jess'], latticeHeaders($action['props']['ref']))
        ->assertOk()
        ->assertJsonPath('data.handled', 'Jess');
});

test('a menu item cannot bind an action and an href together', function (): void {
    MenuItem::make('Log out', 'log-out')->href('/logout')->action(WorkbenchPingAction::class);
})->throws(InvalidArgumentException::class);

test('a menu item cannot set an href after binding an action', function (): void {
    MenuItem::make('Log out', 'log-out')->action(WorkbenchPingAction::class)->href('/logout');
})->throws(InvalidArgumentException::class);

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

test('a link cannot bind an action and an href together', function (): void {
    Link::make('Log out', 'log-out')->href('/logout')->action(WorkbenchPingAction::class);
})->throws(InvalidArgumentException::class);

test('a link cannot set an href after binding an action', function (): void {
    Link::make('Log out', 'log-out')->action(WorkbenchPingAction::class)->href('/logout');
})->throws(InvalidArgumentException::class);

test('a button bound to an action serializes a nested action node sealed to its endpoint', function (): void {
    $wire = wire(Button::make('Ping', 'ping')->action(WorkbenchPingAction::class));

    expect($wire['type'])->toBe('button')
        ->and($wire['props']['href'])->toBeNull()
        ->and($wire['props']['action']['type'])->toBe('action')
        ->and($wire['props']['action']['props']['endpoint'])->toBe('/lattice/actions/workbench.ping')
        ->and($wire['props']['action']['props']['ref'])->not->toBe('');
});

test('the nested action node of a button dispatches through the action endpoint', function (): void {
    $wire = wire(Button::make('Ping', 'ping')->action(WorkbenchPingAction::class));
    $action = $wire['props']['action'];

    postJson($action['props']['endpoint'], ['name' => 'Sam'], latticeHeaders($action['props']['ref']))
        ->assertOk()
        ->assertJsonPath('data.handled', 'Sam');
});

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
