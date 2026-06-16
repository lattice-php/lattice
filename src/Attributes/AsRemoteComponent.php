<?php
declare(strict_types=1);

namespace Lattice\Lattice\Attributes;

use Attribute;

#[Attribute(Attribute::TARGET_CLASS)]
final class AsRemoteComponent extends AsComponent
{
    public function __construct(string $type)
    {
        parent::__construct(str_starts_with($type, 'remote.') ? $type : "remote.{$type}");
    }
}
