<?php
declare(strict_types=1);

namespace Lattice\Board\Sources;

use Closure;
use Lattice\Board\BoardQuery;
use Lattice\Board\BoardResult;
use Lattice\Board\Contracts\BoardSource;

final readonly class CallbackBoardSource implements BoardSource
{
    /**
     * @param  Closure(BoardQuery): BoardResult  $query
     */
    public function __construct(private Closure $query) {}

    public function query(BoardQuery $query): BoardResult
    {
        return ($this->query)($query);
    }
}
