<?php
declare(strict_types=1);

namespace Workbench\App\Support\TypeScript;

use Lattice\Lattice\Support\TypeScript\AllowsListedClasses;
use Lattice\Lattice\Support\TypeScript\MarkerRewriteClassPropertyProcessor;
use Lattice\Lattice\Support\TypeScript\MixedToUnknownClassPropertyProcessor;
use Lattice\Lattice\Ui\Components\Component;
use Spatie\TypeScriptTransformer\PhpNodes\PhpClassNode;
use Spatie\TypeScriptTransformer\Transformers\ClassPropertyProcessors\ClassPropertyProcessor;
use Spatie\TypeScriptTransformer\Transformers\ClassTransformer;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptReference;

/**
 * Emits TypeScript object types only for an explicit allow-list of value
 * objects, so unrelated classes under src/ are never generated.
 */
final class ValueObjectTransformer extends ClassTransformer
{
    use AllowsListedClasses;

    /**
     * @param  array<int, class-string>  $allowed
     */
    public function __construct(array $allowed)
    {
        $this->allowed = $allowed;

        parent::__construct();
    }

    protected function shouldTransform(PhpClassNode $phpClassNode): bool
    {
        return $this->isListed($phpClassNode);
    }

    /**
     * @return array<ClassPropertyProcessor>
     */
    #[\Override]
    protected function classPropertyProcessors(): array
    {
        return [
            ...parent::classPropertyProcessors(),
            new MixedToUnknownClassPropertyProcessor,
            new MarkerRewriteClassPropertyProcessor(
                Component::class,
                fn (): TypeScriptReference => new TypeScriptReference(NodesProvider::wireNodeReference()),
            ),
        ];
    }
}
