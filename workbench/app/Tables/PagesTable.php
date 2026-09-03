<?php
declare(strict_types=1);

namespace Workbench\App\Tables;

use Illuminate\Database\Eloquent\Builder;
use Lattice\Table\Attributes\AsTable;
use Lattice\Table\Columns\Column;
use Lattice\Table\Columns\TextColumn;
use Lattice\Table\Sources\Eloquent\EloquentTableDefinition;
use Lattice\Table\TableQuery;
use Lattice\Ui\Components\Component;
use Lattice\Ui\Components\Link;
use Workbench\App\Models\Page;

/**
 * @extends EloquentTableDefinition<Page>
 */
#[AsTable('workbench.pages')]
class PagesTable extends EloquentTableDefinition
{
    /**
     * @return array<int, Column>
     */
    public function columns(): array
    {
        return [
            TextColumn::make('title')->label(__('workbench.blocks.pages.columns.title'))->sortable(),
            TextColumn::make('slug')->label(__('workbench.blocks.pages.columns.slug')),
            TextColumn::make('revision')->label(__('workbench.blocks.pages.columns.revision')),
        ];
    }

    /**
     * @return Builder<Page>
     */
    public function builder(TableQuery $query): Builder
    {
        $builder = Page::query()->select(['id', 'title', 'slug', 'revision']);

        if ($query->sorts === []) {
            $builder->latest('id');
        }

        return $builder;
    }

    /**
     * @param  array<string, mixed>  $row
     * @return array<int, Component>
     */
    #[\Override]
    public function actions(array $row): array
    {
        return [
            Link::make(__('workbench.blocks.pages.actions.edit'), 'page-edit')->href('/pages/'.$row['id'].'/edit'),
            Link::make(__('workbench.blocks.pages.actions.view'), 'page-view')->href('/pages/'.$row['id']),
            Link::make(__('workbench.blocks.pages.actions.public'), 'page-public')->href('/p/'.$row['slug']),
        ];
    }
}
