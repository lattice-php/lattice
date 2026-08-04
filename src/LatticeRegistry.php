<?php
declare(strict_types=1);

namespace Lattice\Lattice;

use Closure;
use Illuminate\Contracts\Container\Container;
use InvalidArgumentException;
use Lattice\Lattice\Actions\ActionDefinition;
use Lattice\Lattice\Actions\ActionRegistry;
use Lattice\Lattice\Actions\BulkActionDefinition;
use Lattice\Lattice\Actions\BulkActionRegistry;
use Lattice\Lattice\Attributes\WireType;
use Lattice\Lattice\Core\Contracts\PageContract;
use Lattice\Lattice\Forms\FormDefinition;
use Lattice\Lattice\Forms\FormRegistry;
use Lattice\Lattice\Fragments\FragmentDefinition;
use Lattice\Lattice\Fragments\FragmentRegistry;
use Lattice\Lattice\Http\PageRegistry;
use Lattice\Lattice\Layouts\LayoutDefinition;
use Lattice\Lattice\Layouts\LayoutRegistry;
use Lattice\Lattice\Remote\RemoteSourceDefinition;
use Lattice\Lattice\Remote\RemoteSourceRegistry;
use Lattice\Lattice\Support\TypeScript\WireFamily;
use Lattice\Lattice\Tables\TableDefinition;
use Lattice\Lattice\Tables\TableRegistry;
use Lattice\Lattice\Theme\Theme;
use Lattice\Lattice\Theme\ThemeRenderer;
use Lattice\Lattice\Ui\SlotRegistry;

final class LatticeRegistry
{
    /** @var array<string, WireFamily> */
    private array $wireFamilies = [];

    public function __construct(private readonly Container $container) {}

    /**
     * Register a package's lang directory under a namespace, visible to both
     * the translator and the i18next JSON route. Registered on the loader
     * directly because that route resolves only the translation loader, so the
     * deferred loadTranslationsFrom() callback would never fire for it.
     */
    public function translations(string $namespace, string $path): void
    {
        $this->container->make('translation.loader')->addNamespace($namespace, $path);
    }

    /**
     * @param  class-string<FormDefinition>|array<int, class-string<FormDefinition>>  $forms
     */
    public function forms(string|array $forms): void
    {
        $this->container->make(FormRegistry::class)->register($forms);
    }

    /**
     * @param  class-string<TableDefinition>|array<int, class-string<TableDefinition>>  $tables
     */
    public function tables(string|array $tables): void
    {
        $this->container->make(TableRegistry::class)->register($tables);
    }

    /**
     * @param  class-string<FragmentDefinition>|array<int, class-string<FragmentDefinition>>  $fragments
     */
    public function fragments(string|array $fragments): void
    {
        $this->container->make(FragmentRegistry::class)->register($fragments);
    }

    /**
     * @param  class-string<ActionDefinition>|array<int, class-string<ActionDefinition>>  $actions
     */
    public function actions(string|array $actions): void
    {
        $this->container->make(ActionRegistry::class)->register($actions);
    }

    /**
     * @param  class-string<BulkActionDefinition>|array<int, class-string<BulkActionDefinition>>  $bulkActions
     */
    public function bulkActions(string|array $bulkActions): void
    {
        $this->container->make(BulkActionRegistry::class)->register($bulkActions);
    }

    /**
     * @param  class-string<LayoutDefinition>|array<int, class-string<LayoutDefinition>>  $layouts
     */
    public function layouts(string|array $layouts): void
    {
        $this->container->make(LayoutRegistry::class)->register($layouts);
    }

    /**
     * @param  class-string<PageContract>|array<int, class-string<PageContract>>  $pages
     */
    public function pages(string|array $pages): void
    {
        $this->container->make(PageRegistry::class)->register($pages);
    }

    /**
     * @param  class-string<RemoteSourceDefinition>|array<int, class-string<RemoteSourceDefinition>>  $remoteSources
     */
    public function remoteSources(string|array $remoteSources): void
    {
        $this->container->make(RemoteSourceRegistry::class)->register($remoteSources);
    }

    /**
     * @param  callable(string, Container): ?RemoteSourceDefinition  $resolver
     */
    public function remoteSourceResolver(callable $resolver): void
    {
        $this->container->make(RemoteSourceRegistry::class)->resolveUsing($resolver);
    }

    public function extend(string $name, Closure $factory, int $priority = 0): void
    {
        $this->container->make(SlotRegistry::class)->extend($name, $factory, $priority);
    }

    public function theme(Theme|Closure $theme): void
    {
        $this->container->make(ThemeRenderer::class)->register($theme);
    }

    /**
     * @param  class-string<WireType>  $attribute
     * @param  class-string  $reference
     */
    public function wireFamily(
        string $category,
        string $attribute,
        string $reference,
        bool $marker = false,
    ): void {
        if (isset($this->wireFamilies[$category])) {
            throw new InvalidArgumentException(sprintf('Wire family [%s] is already registered.', $category));
        }

        $this->wireFamilies[$category] = new WireFamily($category, $attribute, $reference, $marker);
    }

    /** @return list<WireFamily> */
    public function wireFamilies(): array
    {
        return array_values($this->wireFamilies);
    }

    /** @return list<WireFamily> */
    public function markerWireFamilies(): array
    {
        return array_values(array_filter(
            $this->wireFamilies,
            static fn (WireFamily $family): bool => $family->marker,
        ));
    }

    /** @return list<WireFamily> */
    public function valueWireFamilies(): array
    {
        return array_values(array_filter(
            $this->wireFamilies,
            static fn (WireFamily $family): bool => ! $family->marker,
        ));
    }

    public function wireCategoryFor(WireType $attribute): string
    {
        foreach ($this->markerWireFamilies() as $family) {
            if ($attribute::class === $family->attribute) {
                return $family->category;
            }
        }

        foreach ($this->markerWireFamilies() as $family) {
            if (is_a($attribute, $family->attribute)) {
                return $family->category;
            }
        }

        throw new InvalidArgumentException(sprintf('No wire family is registered for [%s].', $attribute::class));
    }

    public function layoutRegistry(): LayoutRegistry
    {
        return $this->container->make(LayoutRegistry::class);
    }

    public function pageRegistry(): PageRegistry
    {
        return $this->container->make(PageRegistry::class);
    }

    public function remoteSourceRegistry(): RemoteSourceRegistry
    {
        return $this->container->make(RemoteSourceRegistry::class);
    }
}
