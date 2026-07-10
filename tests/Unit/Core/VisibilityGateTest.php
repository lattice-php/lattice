<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Lattice\Core\Components\Text;
use Lattice\Lattice\Support\Evaluation\UnresolvableEvaluationParameter;

it('gates with a boolean through visible and hidden', function (): void {
    expect(Text::make('a')->visible(false)->shouldRender())->toBeFalse()
        ->and(Text::make('a')->hidden()->shouldRender())->toBeFalse()
        ->and(Text::make('a')->hidden(false)->shouldRender())->toBeTrue()
        ->and(Text::make('a')->shouldRender())->toBeTrue();
});

it('resolves a visibility closure lazily with injected utilities', function (): void {
    app()->instance('request', Request::create('/admin/users'));

    $component = Text::make('a')->visible(fn (Request $request): bool => $request->is('admin/*'));

    expect($component->shouldRender())->toBeTrue();

    app()->instance('request', Request::create('/'));

    $component = Text::make('a')->visible(fn (Request $request): bool => $request->is('admin/*'));

    expect($component->shouldRender())->toBeFalse();
});

it('resolves the closure once and memoizes', function (): void {
    $calls = 0;
    $component = Text::make('a')->visible(function () use (&$calls): bool {
        $calls++;

        return true;
    });

    $component->shouldRender();
    $component->shouldRender();

    expect($calls)->toBe(1);
});

it('last write wins between visible and hidden', function (): void {
    expect(Text::make('a')->visible(false)->visible()->shouldRender())->toBeTrue()
        ->and(Text::make('a')->hidden()->visible(true)->shouldRender())->toBeTrue();
});

it('injects the component itself by name and by type', function (): void {
    $component = Text::make('a')->visible(fn ($component): bool => $component instanceof Text);

    expect($component->shouldRender())->toBeTrue();
});

it('resolves a hidden closure once with injected utilities', function (): void {
    $calls = 0;
    $component = Text::make('a')->hidden(function (Text $component) use (&$calls): bool {
        $calls++;

        return true;
    });

    expect($component->shouldRender())->toBeFalse();

    $component->shouldRender();

    expect($calls)->toBe(1);
});

it('resolves visibility closures against the clone, not the template', function (): void {
    $received = [];
    $collect = function ($component) use (&$received): bool {
        $received[] = $component;

        return true;
    };

    $visibleTemplate = Text::make('a')->visible($collect);
    $hiddenTemplate = Text::make('a')->hidden($collect);

    $visibleClone = clone $visibleTemplate;
    $hiddenClone = clone $hiddenTemplate;

    $visibleClone->shouldRender();
    $hiddenClone->shouldRender();

    expect($received[0])->toBe($visibleClone)
        ->and($received[1])->toBe($hiddenClone);
});

it('throws when a visibility closure requests an unresolvable parameter', function (): void {
    $component = Text::make('a')->visible(fn (string $somethingUnresolvable): bool => true);

    expect(fn (): bool => $component->shouldRender())
        ->toThrow(UnresolvableEvaluationParameter::class);
});
