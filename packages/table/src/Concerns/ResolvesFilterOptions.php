<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Concerns;

use Lattice\Lattice\Core\Contracts\OptionSource;
use Lattice\Lattice\Core\Option;

/**
 * Shared option resolution for select-style filters (the dedicated SelectFilter
 * and filterable columns alike): a fixed list, or an {@see OptionSource} that
 * resolves the initial set eagerly and the rest as the user searches.
 */
trait ResolvesFilterOptions
{
    protected ?OptionSource $optionSource = null;

    /**
     * The eager initial option set — from the source, or the given fixed list.
     *
     * @param  list<Option>  $static
     * @return list<Option>
     */
    protected function resolveOptions(array $static): array
    {
        return $this->optionSource?->search('') ?? $static;
    }

    /**
     * @return list<Option>
     */
    protected function searchOptionSource(string $query): array
    {
        return $this->optionSource?->search($query) ?? [];
    }

    protected function hasOptionSource(): bool
    {
        return $this->optionSource !== null;
    }
}
