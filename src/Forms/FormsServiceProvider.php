<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms;

use Illuminate\Support\ServiceProvider;
use Lattice\Lattice\Attributes\AsForm;
use Lattice\Lattice\Core\Discovery\DiscoveryKinds;
use Lattice\Lattice\Forms\RichEditor\Attributes\AsEditorExtension;
use Lattice\Lattice\Forms\RichEditor\EditorExtension;
use Lattice\Lattice\Forms\RichEditor\EditorExtensionRegistry;
use Lattice\Lattice\Support\TypeScript\WireFamilies;
use Lattice\Lattice\Support\TypeScript\WireFamily;
use Lattice\Lattice\Ui\UiServiceProvider;

final class FormsServiceProvider extends ServiceProvider
{
    #[\Override]
    public function register(): void
    {
        $this->app->register(UiServiceProvider::class);

        DiscoveryKinds::register('forms', AsForm::class);

        $this->app->singleton(FormRegistry::class);
        $this->app->singleton(EditorExtensionRegistry::class, fn (): EditorExtensionRegistry => EditorExtensionRegistry::withBuiltins());
        $this->app->make(WireFamilies::class)->register(
            new WireFamily('editor-extension', AsEditorExtension::class, EditorExtension::class),
        );
    }
}
