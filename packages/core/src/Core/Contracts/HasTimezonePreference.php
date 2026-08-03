<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Contracts;

interface HasTimezonePreference
{
    public function preferredTimezone(): ?string;
}
