<?php
declare(strict_types=1);

namespace Lattice\Form;

use Illuminate\Support\ServiceProvider;
use Lattice\Core\Attributes\AsForm;
use Lattice\Core\Discovery\DiscoveryKinds;
use Lattice\Core\Facades\Lattice;
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

        Lattice::wireSource(dirname(__DIR__));
        Lattice::wireFamily('editor-extension', AsEditorExtension::class, EditorExtension::class);
    }
}
