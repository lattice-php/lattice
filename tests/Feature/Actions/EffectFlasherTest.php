<?php
declare(strict_types=1);

use Inertia\Inertia;
use Lattice\Lattice\Effects\Builtin\Callout;
use Lattice\Lattice\Effects\Builtin\Toast;
use Lattice\Lattice\Effects\EffectFlasher;
use Lattice\Lattice\Facades\Effects;
use Lattice\Lattice\Ui\Enums\Variant;

test('effects accumulate across multiple flash calls', function (): void {
    Effects::flash(Effects::toast(Toast::make(Variant::Success, 'Saved.')));
    Effects::flash(Effects::callout(Callout::make(Variant::Warning, 'Heads up.')));

    $effects = app(EffectFlasher::class)->all();

    expect($effects)->toHaveCount(2)
        ->and($effects[0]->jsonSerialize()['type'])->toBe('toast')
        ->and($effects[1]->jsonSerialize()['type'])->toBe('callout');
});

test('flashing no effects is a no-op', function (): void {
    Effects::flash();

    expect(app(EffectFlasher::class)->all())->toBeEmpty();
});

test('the scoped buffer resets between request cycles', function (): void {
    Effects::flash(Effects::toast(Toast::make(Variant::Info, 'One.')));
    expect(app(EffectFlasher::class)->all())->toHaveCount(1);

    app()->forgetScopedInstances();

    expect(app(EffectFlasher::class)->all())->toBeEmpty();
});

test('flash sends the accumulated effects to the latticeEffects bag', function (): void {
    $flashed = [];

    Inertia::shouldReceive('flash')
        ->twice()
        ->with('latticeEffects', Mockery::on(function (array $effects) use (&$flashed): bool {
            $flashed = $effects;

            return true;
        }));

    Effects::flash(Effects::toast(Toast::make(Variant::Success, 'Saved.')));
    Effects::flash(Effects::callout(Callout::make(Variant::Warning, 'Heads up.')));

    expect($flashed)->toHaveCount(2)
        ->and($flashed[0]->jsonSerialize()['type'])->toBe('toast')
        ->and($flashed[1]->jsonSerialize()['type'])->toBe('callout');
});
