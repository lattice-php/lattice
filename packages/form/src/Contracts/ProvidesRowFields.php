<?php
declare(strict_types=1);

namespace Lattice\Form\Contracts;

use Illuminate\Http\Request;
use Lattice\Form\Components\Field;
use Lattice\Form\FormData;

/**
 * @api Consumed by the form walker/validator; implemented by RowsField.
 */
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
    public function rowScope(FormData $form, array $row): FormData;

    public function prefillRowFields(mixed $rows, ?FormData $form = null, ?Request $request = null): void;
}
