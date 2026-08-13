<?php
declare(strict_types=1);

namespace Lattice\Search;

use Lattice\Core\Attributes\TypeScript;

#[TypeScript]
final readonly class SearchResultItem
{
    public function __construct(
        public string $id,
        public string $title,
        public string $link,
        public ?string $subtitle = null,
        public ?string $additionalInfo = null,
        public ?string $badge = null,
    ) {}
}
