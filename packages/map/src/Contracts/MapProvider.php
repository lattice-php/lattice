<?php

declare(strict_types=1);

namespace Lattice\Map\Contracts;

use Lattice\Map\MapProviderData;

interface MapProvider
{
    public function data(): MapProviderData;
}
