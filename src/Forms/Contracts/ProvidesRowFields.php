<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Contracts;

use Illuminate\Http\Request;
use Lattice\Lattice\Forms\Components\Field;
use Lattice\Lattice\Forms\FormData;

interface ProvidesRowFields
{
    /**
     * @param  array<string, mixed>  $row
     * @return array<int, Field>
     */
    public function rowFields(array $row): array;

    /**
     * @param  array<string, mixed>  $row
     */
    public function rowField(array $row, string $name): ?Field;

    /**
     * @param  array<string, mixed>  $row
     */
    public function rowScope(FormData $form, array $row): FormData;

    public function prefillRowFields(mixed $rows, ?FormData $form = null, ?Request $request = null): void;
}
