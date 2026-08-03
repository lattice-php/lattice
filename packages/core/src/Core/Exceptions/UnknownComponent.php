<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Exceptions;

use InvalidArgumentException;

final class UnknownComponent extends InvalidArgumentException
{
    public function __construct(
        public readonly string $type,
        public readonly string $key,
    ) {
        parent::__construct("Lattice {$type} [{$key}] is not registered.");
    }
}
