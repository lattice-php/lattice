<?php
declare(strict_types=1);

namespace Lattice\Media\Tables\Filters;

use Illuminate\Database\Eloquent\Builder;
use Lattice\Form\Components\Select;
use Lattice\Form\FormData;
use Lattice\Media\Support\FolderOptions;
use Lattice\Table\Attributes\AsFilter;
use Lattice\Table\Filters\Filter;

/**
 * Narrows the listing to one folder. An empty value shows every file
 * regardless of folder; `unassigned` shows the ones in no folder at all.
 */
#[AsFilter('filter.media-folder')]
final class MediaFolderFilter extends Filter
{
    public const string UNASSIGNED = 'unassigned';

    /**
     * @return array<int, Select>
     */
    #[\Override]
    public function schema(): array
    {
        return [
            Select::make('value', __('media::media.folders.label'))->options([
                Select::option(__('media::media.folders.unassigned'), self::UNASSIGNED),
                ...FolderOptions::all(),
            ]),
        ];
    }

    public function apply(Builder $builder, FormData $data): void
    {
        $value = $data->get('value');

        if (! is_string($value) || $value === '') {
            return;
        }

        $value === self::UNASSIGNED
            ? $builder->whereNull('folder_id')
            : $builder->where('folder_id', (int) $value);
    }
}
