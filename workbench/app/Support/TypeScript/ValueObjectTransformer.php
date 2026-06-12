<?php

declare(strict_types=1);

namespace Workbench\App\Support\TypeScript;

use Lattice\Lattice\Support\TypeScript\ColumnPropsToRecordClassPropertyProcessor;
use Lattice\Lattice\Support\TypeScript\MixedToUnknownClassPropertyProcessor;
use Spatie\TypeScriptTransformer\PhpNodes\PhpClassNode;
use Spatie\TypeScriptTransformer\Transformers\ClassPropertyProcessors\ClassPropertyProcessor;
use Spatie\TypeScriptTransformer\Transformers\ClassTransformer;

/**
 * Emits TypeScript object types only for an explicit allow-list of value
 * objects, so unrelated classes under src/ are never generated.
 */
final class ValueObjectTransformer extends ClassTransformer
{
    /**
     * @param  array<int, class-string>  $allowed
     */
    public function __construct(private readonly array $allowed)
    {
        parent::__construct();
    }

    protected function shouldTransform(PhpClassNode $phpClassNode): bool
    {
        return in_array($phpClassNode->getName(), $this->allowed, true);
    }

    /**
     * @return array<ClassPropertyProcessor>
     */
    protected function classPropertyProcessors(): array
    {
        return [
            ...parent::classPropertyProcessors(),
            new MixedToUnknownClassPropertyProcessor,
            new ComponentToNodeClassPropertyProcessor,
            new ColumnPropsToRecordClassPropertyProcessor,
        ];
    }
}
