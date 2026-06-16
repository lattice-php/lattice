<?php
declare(strict_types=1);

namespace Workbench\App\Support\TypeScript;

use Lattice\Lattice\Chat\ChatPart;
use Lattice\Lattice\Core\Components\Component;
use Lattice\Lattice\Support\TypeScript\MarkerRewriteClassPropertyProcessor;
use Lattice\Lattice\Support\TypeScript\MixedToUnknownClassPropertyProcessor;
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
    #[\Override]
    protected function classPropertyProcessors(): array
    {
        return [
            ...parent::classPropertyProcessors(),
            new MixedToUnknownClassPropertyProcessor,
            // Runs before the Component marker so a chat part — itself a Component —
            // resolves to the narrower ChatNode union rather than the whole Node union.
            new MarkerRewriteClassPropertyProcessor(
                ChatPart::class,
                fn (): TypeScriptReference => new TypeScriptReference(NodesProvider::chatNodeReference()),
            ),
            new MarkerRewriteClassPropertyProcessor(
                Component::class,
                fn (): TypeScriptReference => new TypeScriptReference(NodesProvider::nodeReference()),
            ),
        ];
    }
}
