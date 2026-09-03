<?php
declare(strict_types=1);

namespace Lattice\Media\Tables;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Lattice\Actions\Components\Action;
use Lattice\Actions\Components\BulkAction;
use Lattice\Media\Actions\DeleteSelectedMediaAction;
use Lattice\Media\Actions\MoveSelectedMediaAction;
use Lattice\Media\Models\Media;
use Lattice\Media\Tables\Filters\MediaFolderFilter;
use Lattice\Media\Tables\Filters\MediaTypeFilter;
use Lattice\Table\Attributes\AsTable;
use Lattice\Table\Columns\Column;
use Lattice\Table\Columns\ImageColumn;
use Lattice\Table\Columns\NumberColumn;
use Lattice\Table\Columns\TextColumn;
use Lattice\Table\Enums\PaginationType;
use Lattice\Table\Filters\Filter;
use Lattice\Table\Sources\Eloquent\EloquentTableDefinition;
use Lattice\Table\TableQuery;

/**
 * @extends EloquentTableDefinition<Media>
 */
#[AsTable('media.library')]
final class MediaTable extends EloquentTableDefinition
{
    /**
     * A row reaches the client projected down to the keys its columns bind, and
     * the grid needs the original next to the derivative (the detail slideout
     * links it for download) — hence the hidden column.
     *
     * @return array<int, Column>
     */
    public function columns(): array
    {
        return [
            ImageColumn::make('preview_url')->label(__('media::media.columns.preview'))->size(44),
            TextColumn::make('url')->label(__('media::media.columns.original'))->toggleable(hiddenByDefault: true),
            TextColumn::make('folder_id')->label(__('media::media.folders.label'))->toggleable(hiddenByDefault: true),
            TextColumn::make('name')->label(__('media::media.columns.name'))->searchable()->sortable(),
            TextColumn::make('mime_type')->label(__('media::media.columns.type')),
            NumberColumn::make('size')->label(__('media::media.columns.size'))->sortable(),
            TextColumn::make('alt')->label(__('media::media.columns.alt')),
            TextColumn::make('created_at')->label(__('media::media.columns.uploaded-at'))->dateTime()->sortable(),
            NumberColumn::make('attachments_count')->label(__('media::media.columns.usage')),
        ];
    }

    /**
     * @return array<int, Filter>
     */
    #[\Override]
    public function filters(): array
    {
        return [
            MediaTypeFilter::make('type')->label(__('media::media.filters.type.label')),
            MediaFolderFilter::make('folder')->label(__('media::media.folders.label')),
        ];
    }

    #[\Override]
    public function pagination(): PaginationType
    {
        return PaginationType::Infinite;
    }

    #[\Override]
    public function perPage(): int
    {
        return 40;
    }

    #[\Override]
    public function authorize(Request $request): bool
    {
        return Gate::allows('viewAny', Media::modelClass());
    }

    /**
     * The category scope rides the sealed context, so a client request can
     * never widen it. Unscoped instances see only uncategorized media:
     * categorized pools surface exclusively through a library that asks for
     * them.
     *
     * @return Builder<Media>
     */
    public function builder(TableQuery $query): Builder
    {
        $builder = Media::modelQuery()->withCount('attachments');
        $category = $this->contextStringOrNull('category');

        $category === null
            ? $builder->whereNull('category')
            : $builder->where('category', $category);

        if ($query->sorts === []) {
            $builder->latest('id');
        }

        return $builder;
    }

    /**
     * @return array<int, Action>
     */
    #[\Override]
    public function bulkActions(): array
    {
        return [
            BulkAction::use(MoveSelectedMediaAction::class),
            BulkAction::use(DeleteSelectedMediaAction::class),
        ];
    }
}
