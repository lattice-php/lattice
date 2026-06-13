<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Contracts;

use Illuminate\Http\Request;
use Lattice\Lattice\Forms\FormData;

interface ProvidesRowPrefills
{
    /**
     * Keyed by full dot path, e.g. `items.2.price`.
     *
     * @return array<string, mixed>
     */
    public function rowPrefillValues(FormData $form, Request $request): array;
}
