<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core;

use Illuminate\Support\ServiceProvider;
use Lattice\Lattice\Core\Contracts\ResolvesReferenceIdentity;
use Lattice\Lattice\Core\Contracts\SignsComponentReferences;
use Lattice\Lattice\Core\Discovery\DiscoveryManifest;
use Lattice\Lattice\Core\Services\ComponentReferenceSigner;
use Lattice\Lattice\Core\Services\RequestReferenceIdentity;

final class CoreServiceProvider extends ServiceProvider
{
    #[\Override]
    public function register(): void
    {
        $this->app->singleton(ResolvesReferenceIdentity::class, RequestReferenceIdentity::class);
        $this->app->singleton(ComponentReferenceSigner::class);
        $this->app->alias(ComponentReferenceSigner::class, SignsComponentReferences::class);
        $this->app->singleton(DiscoveryManifest::class);
        $this->app->singleton(PageMetadataResolver::class);
    }
}
