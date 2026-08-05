<?php
declare(strict_types=1);

namespace Lattice\Core\Attributes;

use Attribute;

#[Attribute(Attribute::TARGET_METHOD)]
class SerializationHook
{
    public function __construct(public readonly int $priority) {}
}
