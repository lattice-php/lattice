<?php
declare(strict_types=1);

namespace Lattice\Lattice\Contracts;

interface HasTimezonePreference
{
    public function preferredTimezone(): ?string;
}
