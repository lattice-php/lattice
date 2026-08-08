<?php
declare(strict_types=1);

namespace Lattice\Form\Components;

use Lattice\Core\Attributes\TypeScript;
use Lattice\Ui\Components\Component;

#[TypeScript]
final readonly class RowTemplateData
{
    /**
     * @param  list<Component>  $schema
     */
    public function __construct(
        public string $type,
        public string $label,
        public array $schema,
    ) {}
}
