<?php

declare(strict_types=1);

namespace Lattice\Form\PatternInput;

use Lattice\Core\Attributes\TypeScript;
use Lattice\Ui\Components\Component;

#[TypeScript]
final readonly class PatternTokenData
{
    /**
     * @param  list<Component>  $schema
     */
    public function __construct(
        public string $name,
        public string $label,
        public array $schema,
    ) {}
}
