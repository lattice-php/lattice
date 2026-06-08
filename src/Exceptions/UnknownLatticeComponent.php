<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Exceptions;

use InvalidArgumentException;

final class UnknownLatticeComponent extends InvalidArgumentException
{
    public function __construct(
        public readonly string $type,
        public readonly string $key,
    ) {
        parent::__construct("Lattice {$type} [{$key}] is not registered.");
    }
}
