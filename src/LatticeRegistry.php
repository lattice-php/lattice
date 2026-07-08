<?php
declare(strict_types=1);

namespace Lattice\Lattice;

use Illuminate\Contracts\Container\Container;
use Lattice\Lattice\Actions\ActionDefinition;
use Lattice\Lattice\Actions\ActionRegistry;
use Lattice\Lattice\Actions\BulkActionDefinition;
use Lattice\Lattice\Actions\BulkActionRegistry;
use Lattice\Lattice\Blocks\BlockDefinition;
use Lattice\Lattice\Blocks\BlockRegistry;
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
use Lattice\Lattice\Tables\TableDefinition;
use Lattice\Lattice\Tables\TableRegistry;

final readonly class LatticeRegistry
{
    public function __construct(
        private ActionRegistry $actions,
        private BlockRegistry $blocks,
        private BulkActionRegistry $bulkActions,
        private FormRegistry $forms,
        private FragmentRegistry $fragments,
        private LayoutRegistry $layouts,
        private PageRegistry $pages,
        private TableRegistry $tables,
        private RemoteSourceRegistry $remoteSources,
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
     * @param  class-string<BlockDefinition>|array<int, class-string<BlockDefinition>>  $blocks
     */
    public function blocks(string|array $blocks): void
    {
        $this->blocks->register($blocks);
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
     * @param  class-string<PageContract>|array<int, class-string<PageContract>>  $pages
     */
    public function pages(string|array $pages): void
    {
        $this->pages->register($pages);
    }

    /**
     * @param  class-string<RemoteSourceDefinition>|array<int, class-string<RemoteSourceDefinition>>  $remoteSources
     */
    public function remoteSources(string|array $remoteSources): void
    {
        $this->remoteSources->register($remoteSources);
    }

    /**
     * @param  callable(string, Container): ?RemoteSourceDefinition  $resolver
     */
    public function remoteSourceResolver(callable $resolver): void
    {
        $this->remoteSources->resolveUsing($resolver);
    }

    public function layoutRegistry(): LayoutRegistry
    {
        return $this->layouts;
    }

    public function pageRegistry(): PageRegistry
    {
        return $this->pages;
    }

    public function remoteSourceRegistry(): RemoteSourceRegistry
    {
        return $this->remoteSources;
    }
}
