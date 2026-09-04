<?php
declare(strict_types=1);

namespace Lattice\Core;

use Illuminate\Support\ServiceProvider;
use Lattice\Core\Contracts\ResolvesReferenceIdentity;
use Lattice\Core\Contracts\SignsComponentReferences;
use Lattice\Core\Discovery\DiscoveryManifest;
use Lattice\Core\Services\ComponentReferenceSigner;
use Lattice\Core\Services\ContextResolutions;
use Lattice\Core\Services\ContextResolvers;
use Lattice\Core\Services\ContextScope;
use Lattice\Core\Services\RequestReferenceIdentity;
use Lattice\Core\Support\Evaluation\Evaluator;

final class CoreServiceProvider extends ServiceProvider
{
    #[\Override]
    public function register(): void
    {
        $this->app->singleton(LatticeRegistry::class);
        $this->app->singleton(Evaluator::class);
        $this->app->singleton(ResolvesReferenceIdentity::class, RequestReferenceIdentity::class);
        $this->app->singleton(ComponentReferenceSigner::class);
        $this->app->alias(ComponentReferenceSigner::class, SignsComponentReferences::class);
        $this->app->scoped(ContextScope::class);
        $this->app->singleton(ContextResolvers::class);
        $this->app->scoped(ContextResolutions::class);
        $this->app->singleton(DiscoveryManifest::class);
        $this->app->singleton(PageMetadataResolver::class);
    }

    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__.'/../routes/web.php');
    }
}
