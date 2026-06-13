<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Contracts;

use Lattice\Lattice\Forms\Components\Field;
use Lattice\Lattice\Forms\FormData;

interface ProvidesRowFields
{
    /**
     * @param  array<string, mixed>  $row
     */
    public function rowField(array $row, string $name): ?Field;

    /**
     * @param  array<string, mixed>  $row
     */
    public function rowScope(FormData $form, array $row): FormData;

    public function prefillRowFields(mixed $rows): void;
}
