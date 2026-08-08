<?php
declare(strict_types=1);

namespace Lattice\Form;

use Illuminate\Support\ServiceProvider;
use Lattice\Core\Discovery\DiscoveryKinds;
use Lattice\Core\LatticeRegistry;
use Lattice\Form\Attributes\AsForm;
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
        $lattice->registerCapability('forms', $this->registerForms(...));
        $lattice->wireFamily('editor-extension', AsEditorExtension::class, EditorExtension::class);
    }

    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__.'/../routes/web.php');
    }

    /** @param  class-string<FormDefinition>|array<int, class-string<FormDefinition>>  $forms */
    private function registerForms(string|array $forms): void
    {
        $this->app->make(FormRegistry::class)->register($forms);
    }
}
