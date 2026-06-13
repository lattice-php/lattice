<?php

declare(strict_types=1);

namespace Lattice\Lattice\Core\Contracts;

interface Discoverable
{
    /** @return class-string */
    public function attributeClass(): string;

    public function group(): string;

    /** @param array<int, class-string> $definitions */
    public function registerDiscovered(array $definitions): void;
}
