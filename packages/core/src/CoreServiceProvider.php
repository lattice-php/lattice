<?php
declare(strict_types=1);

namespace Lattice\Core;

use Illuminate\Support\ServiceProvider;
use Lattice\Core\Contracts\ResolvesReferenceIdentity;
use Lattice\Core\Contracts\SignsComponentReferences;
use Lattice\Core\Discovery\DiscoveryManifest;
use Lattice\Core\Services\ComponentReferenceSigner;
use Lattice\Core\Services\RequestReferenceIdentity;

final class CoreServiceProvider extends ServiceProvider
{
    #[\Override]
    public function register(): void
    {
        $this->app->singleton(LatticeRegistry::class);
        $this->app->singleton(ResolvesReferenceIdentity::class, RequestReferenceIdentity::class);
        $this->app->singleton(ComponentReferenceSigner::class);
        $this->app->alias(ComponentReferenceSigner::class, SignsComponentReferences::class);
        $this->app->singleton(DiscoveryManifest::class);
        $this->app->singleton(PageMetadataResolver::class);
    }
}
