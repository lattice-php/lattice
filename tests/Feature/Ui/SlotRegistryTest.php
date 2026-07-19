<?php

declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Ui\Components\Component;
use Lattice\Lattice\Ui\Components\Text;
use Lattice\Lattice\Ui\Slot;

interface SlotContextContract {}

final readonly class SlotContext implements SlotContextContract
{
    public function __construct(public string $name) {}
}

final class SlotContainerService {}

it('resolves slot contributions by priority with stable registration order', function (): void {
    Lattice::extend('dashboard.cards', fn (): Text => Text::make('Last'), priority: 20);
    Lattice::extend('dashboard.cards', fn (): Text => Text::make('First'), priority: 10);
    Lattice::extend('dashboard.cards', fn (): Text => Text::make('Second'), priority: 10);

    $labels = array_map(
        static fn (Component $component): string => wire($component)['props']['text'],
        Slot::make('dashboard.cards')->resolveComponents(),
    );

    expect($labels)->toBe(['First', 'Second', 'Last']);
});

it('memoizes one slot instance while fresh slots build fresh components', function (): void {
    $calls = 0;
    $component = Text::make('Card');

    Lattice::extend('dashboard.cards', function () use (&$calls, $component): Text {
        $calls++;

        return $component;
    });

    $slot = Slot::make('dashboard.cards');
    $first = $slot->resolveComponents();
    $second = $slot->resolveComponents();
    $fresh = Slot::make('dashboard.cards')->resolveComponents();

    expect($calls)->toBe(2)
        ->and($second)->toBe($first)
        ->and($first[0])->not->toBe($component)
        ->and($fresh[0])->not->toBe($first[0]);
});

it('memoizes an empty slot result', function (): void {
    $slot = Slot::make('dashboard.cards');

    expect($slot->resolveComponents())->toBe([]);

    Lattice::extend('dashboard.cards', fn (): Text => Text::make('Late card'));

    expect($slot->resolveComponents())->toBe([])
        ->and(Slot::make('dashboard.cards')->resolveComponents())->toHaveCount(1);
});

it('injects named typed request user slot and container utilities', function (): void {
    $project = new SlotContext('Lattice');
    $user = workbenchTestUser();
    $request = Request::create('/extension-slot');
    $service = new SlotContainerService;
    $captured = [];

    $this->actingAs($user);
    app()->instance('request', $request);
    app()->instance(SlotContainerService::class, $service);

    Lattice::extend('project.settings.tabs', function (
        string $label,
        SlotContext $concrete,
        SlotContextContract $contract,
        $user,
        $slot,
        Slot $typedSlot,
        Request $request,
        SlotContainerService $service,
    ) use (&$captured): Text {
        $captured = [
            'concrete' => $concrete,
            'contract' => $contract,
            'user' => $user,
            'slot' => $slot,
            'typedSlot' => $typedSlot,
            'request' => $request,
            'service' => $service,
        ];

        return Text::make($label);
    });

    $slot = Slot::make('project.settings.tabs')->context([
        'label' => 'Injected tab',
        'project' => $project,
    ]);
    $components = $slot->resolveComponents();

    expect(wire($components[0])['props']['text'])->toBe('Injected tab')
        ->and($captured['concrete'])->toBe($project)
        ->and($captured['contract'])->toBe($project)
        ->and($captured['user'])->toBe($user)
        ->and($captured['slot'])->toBe($slot)
        ->and($captured['typedSlot'])->toBe($slot)
        ->and($captured['request'])->toBe($request)
        ->and($captured['service'])->toBe($service);
});

it('clears a memoized result when slot context is replaced', function (): void {
    $calls = 0;

    Lattice::extend('project.settings.tabs', function (string $label) use (&$calls): Text {
        $calls++;

        return Text::make($label);
    });

    $slot = Slot::make('project.settings.tabs')->context(['label' => 'First']);
    $first = $slot->resolveComponents();
    $second = $slot->context(['label' => 'Second'])->resolveComponents();

    expect(wire($first[0])['props']['text'])->toBe('First')
        ->and(wire($second[0])['props']['text'])->toBe('Second')
        ->and($calls)->toBe(2);
});

it('rejects a slot factory that does not return a component', function (): void {
    Lattice::extend('project.settings.tabs', fn (): string => 'invalid');

    expect(fn (): array => Slot::make('project.settings.tabs')->resolveComponents())
        ->toThrow(
            UnexpectedValueException::class,
            'Slot [project.settings.tabs] extension must return a component; [string] returned.',
        );
});
