<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Contracts;

use Lattice\Lattice\Core\Option;

/**
 * Where a searchable Select's options come from. Lattice ships an Eloquent
 * source; implement this for any other backing store (an array, an API, a
 * search index). Keeps the Select itself free of any persistence concern.
 */
interface OptionSource
{
    /**
     * Options matching the search query — an empty query returns the initial set.
     *
     * @return list<Option>
     */
    public function search(string $query): array;

    /**
     * Options for the currently-selected value(s), used to render labels on edit
     * forms. Always receives an array so a single and a multiple select behave alike.
     *
     * @param  list<string>  $values
     * @return list<Option>
     */
    public function selected(array $values): array;
}
