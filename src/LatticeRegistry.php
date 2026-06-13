<?php
declare(strict_types=1);

namespace Lattice\Lattice;

use Illuminate\Routing\Route;
use Illuminate\Routing\Router;
use InvalidArgumentException;
use Lattice\Lattice\Actions\ActionDefinition;
use Lattice\Lattice\Actions\ActionRegistry;
use Lattice\Lattice\Actions\BulkActionDefinition;
use Lattice\Lattice\Actions\BulkActionRegistry;
use Lattice\Lattice\Core\Contracts\Discoverable;
use Lattice\Lattice\Core\Contracts\DiscoversDefinitions;
use Lattice\Lattice\Core\DefinitionRegistry;
use Lattice\Lattice\Forms\FormDefinition;
use Lattice\Lattice\Forms\FormRegistry;
use Lattice\Lattice\Fragments\FragmentDefinition;
use Lattice\Lattice\Fragments\FragmentRegistry;
use Lattice\Lattice\Http\PageContract;
use Lattice\Lattice\Layouts\LayoutDefinition;
use Lattice\Lattice\Layouts\LayoutRegistry;
use Lattice\Lattice\Pages\PageRegistry;
use Lattice\Lattice\Tables\TableDefinition;
use Lattice\Lattice\Tables\TableRegistry;

final class LatticeRegistry
{
    public function __construct(
        private readonly ActionRegistry $actions,
        private readonly BulkActionRegistry $bulkActions,
        private readonly DiscoversDefinitions $discovery,
        private readonly FormRegistry $forms,
        private readonly FragmentRegistry $fragments,
        private readonly LayoutRegistry $layouts,
        private readonly PageRegistry $pages,
        private readonly Router $router,
        private readonly TableRegistry $tables,
    ) {}

    /**
     * @param  class-string<FormDefinition>|array<int, class-string<FormDefinition>>  $forms
     */
    public function forms(string|array $forms): void
    {
        $this->forms->register($forms);
    }

    /**
     * @param  class-string<TableDefinition>|array<int, class-string<TableDefinition>>  $tables
     */
    public function tables(string|array $tables): void
    {
        $this->tables->register($tables);
    }

    /**
     * @param  class-string<FragmentDefinition>|array<int, class-string<FragmentDefinition>>  $fragments
     */
    public function fragments(string|array $fragments): void
    {
        $this->fragments->register($fragments);
    }

    /**
     * @param  class-string<ActionDefinition>|array<int, class-string<ActionDefinition>>  $actions
     */
    public function actions(string|array $actions): void
    {
        $this->actions->register($actions);
    }

    /**
     * @param  class-string<BulkActionDefinition>|array<int, class-string<BulkActionDefinition>>  $bulkActions
     */
    public function bulkActions(string|array $bulkActions): void
    {
        $this->bulkActions->register($bulkActions);
    }

    /**
     * @param  class-string<LayoutDefinition>|array<int, class-string<LayoutDefinition>>  $layouts
     */
    public function layouts(string|array $layouts): void
    {
        $this->layouts->register($layouts);
    }

    /**
     * @param  class-string|array<int, class-string>  $pages
     */
    public function pages(string|array $pages): void
    {
        $this->pages->register($pages);
    }

    public function layoutRegistry(): LayoutRegistry
    {
        return $this->layouts;
    }

    public function registerConfiguredDefinitions(): void
    {
        foreach ($this->discoverableRegistries() as $group => $registry) {
            $configured = config("lattice.{$group}.registered", []);

            if (is_array($configured) && $configured !== []) {
                $registry->register($configured);
            }
        }

        $configuredPages = config('lattice.pages.registered', []);

        if (is_array($configuredPages) && $configuredPages !== []) {
            $this->pages->register($configuredPages);
        }
    }

    public function discover(string $path, string $namespace): void
    {
        /** @var array<string, Discoverable> $registries */
        $registries = array_merge(
            $this->discoverableRegistries(),
            ['pages' => $this->pages],
        );

        $definitions = $this->discovery->discover($path, $namespace, array_values($registries));

        foreach ($definitions as $group => $classes) {
            if ($classes !== []) {
                $registries[$group]->registerDiscovered($classes);
            }
        }
    }

    /**
     * @return array<string, DefinitionRegistry<*>>
     */
    private function discoverableRegistries(): array
    {
        $registries = [$this->forms, $this->tables, $this->actions, $this->fragments, $this->bulkActions, $this->layouts];

        return array_combine(
            array_map(static fn (DefinitionRegistry $registry): string => $registry->group(), $registries),
            $registries,
        );
    }

    /**
     * @param  class-string  $page
     */
    public function page(string $uri, string $page): Route
    {
        if (! is_a($page, PageContract::class, true)) {
            throw new InvalidArgumentException(sprintf(
                'Lattice page [%s] must implement [%s].',
                $page,
                PageContract::class,
            ));
        }

        return $this->router->get($uri, [$page, 'render']);
    }
}
