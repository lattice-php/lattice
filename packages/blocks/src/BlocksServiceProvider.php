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
use Lattice\Core\Services\EndpointAreas;
use Lattice\Core\Values\EndpointArea;

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
        $this->loadViewsFrom(__DIR__.'/../resources/views', 'blocks');
        $this->publishes([
            __DIR__.'/../resources/views' => $this->app->resourcePath('views/vendor/blocks'),
        ], 'lattice-blocks-views');

        $this->app->make(EndpointAreas::class)->routes(static function (EndpointArea $area): void {
            Route::middleware($area->middleware('blocks'))
                ->match(['post', 'patch'], $area->uri('block-editors/{editor}', 'lattice.blocks.endpoint'), BlockEditorController::class)
                ->where('editor', '.*')
                ->name($area->routeName('lattice.block-editors.show'));
        });
    }
}
