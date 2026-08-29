<?php
declare(strict_types=1);

namespace Lattice\Board\Contracts;

use Lattice\Board\BoardQuery;
use Lattice\Board\BoardResult;

/**
 * Where a board's cards come from. Lattice ships an Eloquent source; implement
 * this for any other backing store. Keeps the Board component free of
 * persistence concerns.
 */
interface BoardSource
{
    public function query(BoardQuery $query): BoardResult;
}
