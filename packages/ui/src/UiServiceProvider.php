<?php
declare(strict_types=1);

namespace Lattice\Ui;

use Closure;
use Illuminate\Support\ServiceProvider;
use Lattice\Core\Attributes\AsComponent;
use Lattice\Core\CoreServiceProvider;
use Lattice\Core\LatticeRegistry;
use Lattice\Core\Support\Evaluation\Evaluator;
use Lattice\Ui\Components\Component;
use Lattice\Ui\Effects\Attributes\AsEffect;
use Lattice\Ui\Effects\Effect;
use Lattice\Ui\Effects\EffectFlasher;
use Lattice\Ui\Effects\EffectRegistry;

final class UiServiceProvider extends ServiceProvider
{
    #[\Override]
    public function register(): void
    {
        $this->app->register(CoreServiceProvider::class);

        $this->app->singleton(SlotRegistry::class);
        $this->app->singleton(Evaluator::class, fn ($app): Evaluator => new Evaluator($app, [Component::class]));
        $this->app->singleton(EffectRegistry::class, fn (): EffectRegistry => EffectRegistry::withBuiltins());
        $this->app->scoped(EffectFlasher::class);
        $this->app->scoped(BreadcrumbTrail::class);

        $lattice = $this->app->make(LatticeRegistry::class);
        $lattice->registerCapability('extend', fn (string $name, Closure $factory, int $priority = 0) => $this->app->make(SlotRegistry::class)->extend($name, $factory, $priority));
        $lattice->wireFamily('component', AsComponent::class, Component::class, marker: true);
        $lattice->wireFamily('effect', AsEffect::class, Effect::class);
    }

    public function boot(): void
    {
        $this->app->make(LatticeRegistry::class)->translations('lattice-ui', __DIR__.'/../lang');

        $this->publishes([
            __DIR__.'/../lang' => $this->app->langPath('vendor/lattice-ui'),
        ], 'lattice-translations');
    }
}
