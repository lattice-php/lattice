<?php
declare(strict_types=1);

namespace Lattice\Ui\I18n\Contracts;

interface HasTimezonePreference
{
    public function preferredTimezone(): ?string;
}
