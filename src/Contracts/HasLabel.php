<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Contracts;

interface HasLabel
{
    /**
     * The human-readable label for this value. Return a translated string
     * (e.g. via __()) to localise option labels.
     */
    public function getLabel(): string;
}
