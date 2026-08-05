<?php
declare(strict_types=1);

namespace Lattice\Ui;

use Illuminate\Support\ServiceProvider;
use Lattice\Core\Attributes\AsComponent;
use Lattice\Core\CoreServiceProvider;
use Lattice\Core\Facades\Lattice;
use Lattice\Core\Support\Evaluation\Evaluator;
use Lattice\Ui\Components\Component;
use Lattice\Ui\Effects\Attributes\AsEffect;
use Lattice\Ui\Effects\Effect;

final class UiServiceProvider extends ServiceProvider
{
    #[\Override]
    public function register(): void
    {
        $this->app->register(CoreServiceProvider::class);

        $this->app->singleton(SlotRegistry::class);
        $this->app->singleton(Evaluator::class, fn ($app): Evaluator => new Evaluator($app, [Component::class]));

        Lattice::wireSource(__DIR__);
        Lattice::wireFamily('component', AsComponent::class, Component::class, marker: true);
        Lattice::wireFamily('effect', AsEffect::class, Effect::class);
    }
}
