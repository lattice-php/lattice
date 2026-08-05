<?php
declare(strict_types=1);

namespace Lattice\Form;

use Lattice\Form\Components\Field;

final readonly class FormFieldInstance
{
    public function __construct(
        public Field $field,
        public string $path,
        public FormData $scope,
        public FormData $form,
    ) {}
}
