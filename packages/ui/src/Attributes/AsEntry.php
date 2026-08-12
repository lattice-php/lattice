<?php
declare(strict_types=1);

namespace Lattice\Ui\Attributes;

use Attribute;
use Lattice\Core\Attributes\AsComponent;
use Lattice\Ui\Enums\EntryType;

#[Attribute(Attribute::TARGET_CLASS)]
readonly class AsEntry extends AsComponent
{
    public function __construct(EntryType|string $type)
    {
        parent::__construct(EntryType::wireType($type));
    }
}
