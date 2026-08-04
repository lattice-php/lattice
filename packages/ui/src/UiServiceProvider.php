<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui;

use Illuminate\Support\ServiceProvider;
use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Core\CoreServiceProvider;
use Lattice\Lattice\Effects\Attributes\AsEffect;
use Lattice\Lattice\Effects\Effect;
use Lattice\Lattice\Effects\EffectRegistry;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Support\Evaluation\Evaluator;
use Lattice\Lattice\Ui\Components\Component;

final class UiServiceProvider extends ServiceProvider
{
    #[\Override]
    public function register(): void
    {
        $this->app->register(CoreServiceProvider::class);

        $this->app->singleton(SlotRegistry::class);
        $this->app->singleton(EffectRegistry::class, fn (): EffectRegistry => EffectRegistry::withBuiltins());
        $this->app->singleton(Evaluator::class, fn ($app): Evaluator => new Evaluator($app, [Component::class]));

        Lattice::wireSource(__DIR__);
        Lattice::wireFamily('component', AsComponent::class, Component::class, marker: true);
        Lattice::wireFamily('effect', AsEffect::class, Effect::class);
    }
}
