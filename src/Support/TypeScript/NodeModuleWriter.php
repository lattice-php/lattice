<?php
declare(strict_types=1);

namespace Lattice\Lattice\Support\TypeScript;

use RuntimeException;
use Spatie\TypeScriptTransformer\Collections\TransformedCollection;
use Spatie\TypeScriptTransformer\Data\WriteableFile;
use Spatie\TypeScriptTransformer\Transformed\Transformed;
use Spatie\TypeScriptTransformer\Writers\FlatModuleWriter;

/**
 * The base-module writer, plus the envelope machinery the generated shapes plug
 * into (`Node`, `ColumnNode`, `FilterNode`, the `ResolveProps` calculus and the
 * augmentable interfaces), inlined from the stubs directory so the module is
 * fully self-contained; hand-written modules re-export from it.
 */
final class NodeModuleWriter extends FlatModuleWriter
{
    /**
     * @param  array<mixed>  $transformed
     * @return array<WriteableFile>
     */
    #[\Override]
    public function output(array $transformed, TransformedCollection $transformedCollection): array
    {
        $this->guardUniqueNames($transformed);

        $envelopes = (string) file_get_contents(__DIR__.'/stubs/envelopes.ts');

        return array_map(
            fn (WriteableFile $file): WriteableFile => new WriteableFile(
                $file->path,
                $envelopes.$file->contents,
                $file->changed,
            ),
            parent::output($transformed, $transformedCollection),
        );
    }

    /**
     * @param  array<mixed>  $transformed
     */
    private function guardUniqueNames(array $transformed): void
    {
        $seen = [];

        foreach ($transformed as $item) {
            if (! $item instanceof Transformed) {
                continue;
            }

            $name = $item->getName();

            if ($name === null) {
                continue;
            }

            if (isset($seen[$name])) {
                throw new RuntimeException(sprintf(
                    'Duplicate generated type name [%s]. Rename the class, or prefix its family via the wire-type attribute\'s typeNamePrefix().',
                    $name,
                ));
            }

            $seen[$name] = true;
        }
    }
}
