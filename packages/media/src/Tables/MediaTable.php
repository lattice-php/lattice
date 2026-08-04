<?php
declare(strict_types=1);

namespace Lattice\Media\Tables;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Lattice\Lattice\Actions\Components\Action;
use Lattice\Lattice\Actions\Components\BulkAction;
use Lattice\Lattice\Attributes\AsTable;
use Lattice\Lattice\Tables\Columns\Column;
use Lattice\Lattice\Tables\Columns\ImageColumn;
use Lattice\Lattice\Tables\Columns\NumberColumn;
use Lattice\Lattice\Tables\Columns\TextColumn;
use Lattice\Lattice\Tables\Enums\PaginationType;
use Lattice\Lattice\Tables\Filters\Filter;
use Lattice\Lattice\Tables\Sources\Eloquent\EloquentTableDefinition;
use Lattice\Lattice\Tables\TableQuery;
use Lattice\Media\Actions\DeleteSelectedMediaAction;
use Lattice\Media\Models\Media;
use Lattice\Media\Tables\Filters\MediaTypeFilter;

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
            TextColumn::make('name')->label(__('media::media.columns.name'))->searchable(),
            TextColumn::make('mime_type')->label(__('media::media.columns.type')),
            NumberColumn::make('size')->label(__('media::media.columns.size')),
            TextColumn::make('alt')->label(__('media::media.columns.alt')),
            TextColumn::make('created_at')->label(__('media::media.columns.uploaded-at'))->dateTime(),
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
     * @return Builder<Media>
     */
    public function builder(TableQuery $query): Builder
    {
        $builder = Media::modelQuery()->withCount('attachments');

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
        return [BulkAction::use(DeleteSelectedMediaAction::class)];
    }
}
