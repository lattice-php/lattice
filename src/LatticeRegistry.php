<?php
declare(strict_types=1);

namespace Lattice\Lattice;

use Lattice\Lattice\Actions\ActionDefinition;
use Lattice\Lattice\Actions\ActionRegistry;
use Lattice\Lattice\Actions\BulkActionDefinition;
use Lattice\Lattice\Actions\BulkActionRegistry;
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
        private readonly FormRegistry $forms,
        private readonly FragmentRegistry $fragments,
        private readonly LayoutRegistry $layouts,
        private readonly PageRegistry $pages,
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
     * @param  class-string<PageContract>|array<int, class-string<PageContract>>  $pages
     */
    public function pages(string|array $pages): void
    {
        $this->pages->register($pages);
    }

    public function layoutRegistry(): LayoutRegistry
    {
        return $this->layouts;
    }

    public function pageRegistry(): PageRegistry
    {
        return $this->pages;
    }
}
