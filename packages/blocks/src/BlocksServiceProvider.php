<?php
declare(strict_types=1);

namespace Lattice\Blocks;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Lattice\Blocks\Attributes\AsBlock;
use Lattice\Blocks\Attributes\AsBlockEditor;
use Lattice\Blocks\Http\BlockEditorController;
use Lattice\Core\Discovery\DiscoveryKinds;
use Lattice\Core\Facades\Lattice;

final class BlocksServiceProvider extends ServiceProvider
{
    #[\Override]
    public function register(): void
    {
        DiscoveryKinds::register('blocks', AsBlock::class);
        DiscoveryKinds::register('block-editors', AsBlockEditor::class);

        $this->app->singleton(BlockRegistry::class);
        $this->app->singleton(BlockEditorRegistry::class);
    }

    public function boot(): void
    {
        Lattice::translations('blocks', __DIR__.'/../lang');

        // Core's routes file has no contribution seam, so the package registers
        // its endpoint itself, mirroring core's group conventions
        // (config lattice.blocks.{middleware,endpoint}).
        Route::middleware(config('lattice.blocks.middleware', ['web', 'auth']))
            ->match(['post', 'patch'], (string) config('lattice.blocks.endpoint', 'lattice/block-editors/{editor}'), BlockEditorController::class)
            ->where('editor', '.*')
            ->name('lattice.block-editors.show');
    }
}
