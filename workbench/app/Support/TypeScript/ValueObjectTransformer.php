<?php
declare(strict_types=1);

namespace Workbench\App\Support\TypeScript;

use Lattice\Lattice\Chat\ChatPart;
use Lattice\Lattice\Core\Components\Component;
use Lattice\Lattice\Support\TypeScript\MarkerRewriteClassPropertyProcessor;
use Lattice\Lattice\Support\TypeScript\MixedToUnknownClassPropertyProcessor;
use Lattice\Lattice\Tables\Columns\ColumnProps;
use Spatie\TypeScriptTransformer\PhpNodes\PhpClassNode;
use Spatie\TypeScriptTransformer\Transformers\ClassPropertyProcessors\ClassPropertyProcessor;
use Spatie\TypeScriptTransformer\Transformers\ClassTransformer;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptGeneric;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptIdentifier;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptReference;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptString;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptUnknown;

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
            new MarkerRewriteClassPropertyProcessor(
                ColumnProps::class,
                fn (): TypeScriptGeneric => new TypeScriptGeneric(
                    new TypeScriptIdentifier('Record'),
                    [new TypeScriptString, new TypeScriptUnknown],
                ),
            ),
        ];
    }
}
