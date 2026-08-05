<?php
declare(strict_types=1);

namespace Lattice\I18n\Contracts;

interface HasTimezonePreference
{
    public function preferredTimezone(): ?string;
}
