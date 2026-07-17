<?php
declare(strict_types=1);

namespace Lattice\Lattice\Support\TypeScript;

use RuntimeException;
use Spatie\TypeScriptTransformer\Collections\TransformedCollection;
use Spatie\TypeScriptTransformer\Data\WriteableFile;
use Spatie\TypeScriptTransformer\Transformed\Transformed;
use Spatie\TypeScriptTransformer\Writers\FlatModuleWriter;

/**
 * The base-module writer, plus the imports the generated module can't declare
 * itself: the augmentable envelopes. Component-typed props generate as
 * `Node<"type">`/`Node` (see {@see ComponentTransformer}), Column/Filter-typed
 * props as `ColumnNode`/`FilterNode`, and `WireNode` aliases `Node` — the flat
 * module references those envelopes but never defines them. The resulting
 * import cycles are type-only, so they erase at runtime.
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

        return array_map(
            fn (WriteableFile $file): WriteableFile => new WriteableFile(
                $file->path,
                $this->header($file->contents).$file->contents,
                $file->changed,
            ),
            parent::output($transformed, $transformedCollection),
        );
    }

    private function header(string $contents): string
    {
        $header = 'import type { Node } from "@lattice-php/lattice/core/types";'."\n";

        $envelopes = array_values(array_filter(
            ['ColumnNode', 'FilterNode'],
            fn (string $envelope): bool => preg_match('/\b'.$envelope.'\b/', $contents) === 1,
        ));

        if ($envelopes !== []) {
            $header .= sprintf(
                'import type { %s } from "@lattice-php/lattice/table/types";'."\n",
                implode(', ', $envelopes),
            );
        }

        return $header;
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
