<?php

declare(strict_types=1);

namespace Bambamboole\Lattice;

use Bambamboole\Lattice\Actions\ActionDefinition;
use Bambamboole\Lattice\Actions\ActionRegistry;
use Bambamboole\Lattice\Actions\BulkActionDefinition;
use Bambamboole\Lattice\Actions\BulkActionRegistry;
use Bambamboole\Lattice\Contracts\PageContract;
use Bambamboole\Lattice\Discovery\DefinitionDiscovery;
use Bambamboole\Lattice\Forms\FormDefinition;
use Bambamboole\Lattice\Forms\FormRegistry;
use Bambamboole\Lattice\Fragments\FragmentDefinition;
use Bambamboole\Lattice\Fragments\FragmentRegistry;
use Bambamboole\Lattice\Menu\MenuRegistry;
use Bambamboole\Lattice\Tables\TableDefinition;
use Bambamboole\Lattice\Tables\TableRegistry;
use Illuminate\Routing\Route;
use Illuminate\Routing\Router;
use InvalidArgumentException;

class LatticeRegistry
{
    public function __construct(
        private readonly ActionRegistry $actions,
        private readonly BulkActionRegistry $bulkActions,
        private readonly DefinitionDiscovery $discovery,
        private readonly FormRegistry $forms,
        private readonly FragmentRegistry $fragments,
        private readonly MenuRegistry $menus,
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

    public function menus(): MenuRegistry
    {
        return $this->menus;
    }

    public function discover(string $path, string $namespace): void
    {
        $definitions = $this->discovery->discover($path, $namespace);

        if ($definitions['forms'] !== []) {
            $this->forms($definitions['forms']);
        }

        if ($definitions['tables'] !== []) {
            $this->tables($definitions['tables']);
        }

        if ($definitions['actions'] !== []) {
            $this->actions($definitions['actions']);
        }

        if ($definitions['fragments'] !== []) {
            $this->fragments($definitions['fragments']);
        }
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
