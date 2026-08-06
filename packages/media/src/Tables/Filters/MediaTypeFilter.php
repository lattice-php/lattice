<?php
declare(strict_types=1);

namespace Lattice\Media\Tables\Filters;

use Illuminate\Database\Eloquent\Builder;
use Lattice\Form\Components\Select;
use Lattice\Form\FormData;
use Lattice\Table\Attributes\AsFilter;
use Lattice\Table\Enums\FilterControl;
use Lattice\Table\Filters\Filter;

#[AsFilter(FilterControl::Select)]
final class MediaTypeFilter extends Filter
{
    /**
     * @return array<int, Select>
     */
    #[\Override]
    public function schema(): array
    {
        return [
            Select::make('value', __('media::media.filters.type.label'))->options([
                Select::option(__('media::media.filters.type.image'), 'image'),
                Select::option(__('media::media.filters.type.video'), 'video'),
                Select::option(__('media::media.filters.type.audio'), 'audio'),
                Select::option(__('media::media.filters.type.document'), 'document'),
            ]),
        ];
    }

    public function apply(Builder $builder, FormData $data): void
    {
        $type = $data->get('value');

        if (! is_string($type) || $type === '') {
            return;
        }

        match ($type) {
            'image', 'video', 'audio' => $builder->where('mime_type', 'like', $type.'/%'),
            'document' => $builder
                ->where('mime_type', 'not like', 'image/%')
                ->where('mime_type', 'not like', 'video/%')
                ->where('mime_type', 'not like', 'audio/%'),
            default => null,
        };
    }
}
