<?php
declare(strict_types=1);

namespace Lattice\Form;

use Illuminate\Support\ServiceProvider;
use Lattice\Core\Attributes\AsForm;
use Lattice\Core\Discovery\DiscoveryKinds;
use Lattice\Core\LatticeRegistry;
use Lattice\Form\RichEditor\Attributes\AsEditorExtension;
use Lattice\Form\RichEditor\EditorExtension;
use Lattice\Form\RichEditor\EditorExtensionRegistry;
use Lattice\Ui\UiServiceProvider;

final class FormServiceProvider extends ServiceProvider
{
    #[\Override]
    public function register(): void
    {
        $this->app->register(UiServiceProvider::class);

        DiscoveryKinds::register('forms', AsForm::class);

        $this->app->singleton(FormRegistry::class);
        $this->app->singleton(EditorExtensionRegistry::class, fn (): EditorExtensionRegistry => EditorExtensionRegistry::withBuiltins());

        $lattice = $this->app->make(LatticeRegistry::class);
        $lattice->registerCapability('forms', fn (string|array $forms) => $this->app->make(FormRegistry::class)->register($forms));
        $lattice->wireSource(dirname(__DIR__));
        $lattice->wireFamily('editor-extension', AsEditorExtension::class, EditorExtension::class);
    }

    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__.'/../routes/web.php');
    }
}
