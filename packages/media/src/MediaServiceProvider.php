<?php
declare(strict_types=1);

namespace Lattice\Media;

use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Lattice\Lattice\Forms\RichEditor\EditorExtensionRegistry;
use Lattice\Media\Console\Commands\GenerateConversionsCommand;
use Lattice\Media\Forms\RichEditor\MediaImage;
use Lattice\Media\Models\Media;
use Lattice\Media\Policies\MediaPolicy;

final class MediaServiceProvider extends ServiceProvider
{
    #[\Override]
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__.'/../config/media.php', 'media');
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../database/migrations');

        if ($this->app->runningInConsole()) {
            $this->commands([GenerateConversionsCommand::class]);
        }

        Gate::policy(Media::class, MediaPolicy::class);

        // Registered directly on the loader (not loadTranslationsFrom): the
        // i18next JSON route resolves only the translation loader, never the
        // translator, so the deferred callback would not fire for it.
        $this->app->make('translation.loader')->addNamespace('media', __DIR__.'/../lang');

        $this->app->make(EditorExtensionRegistry::class)->register(MediaImage::class);
    }
}
