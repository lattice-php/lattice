<?php
declare(strict_types=1);

namespace Lattice\Search;

use Lattice\Core\Attributes\TypeScript;

#[TypeScript]
final readonly class RecordSelectionResponse
{
    public function __construct(
        public SearchResult $data,
        public RecordSelectionState $state,
    ) {}
}
