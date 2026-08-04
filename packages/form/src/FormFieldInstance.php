<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms;

use Lattice\Lattice\Forms\Components\Field;

final readonly class FormFieldInstance
{
    public function __construct(
        public Field $field,
        public string $path,
        public FormData $scope,
        public FormData $form,
    ) {}
}
