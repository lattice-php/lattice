<?php
declare(strict_types=1);

namespace Lattice\Lattice\Support\TypeScript;

use Spatie\TypeScriptTransformer\Collections\TransformedCollection;
use Spatie\TypeScriptTransformer\Data\WriteableFile;
use Spatie\TypeScriptTransformer\Writers\FlatModuleWriter;

/**
 * The base-module writer, plus the one import the generated module can't declare
 * itself: the augmentable `Node` from core/types. Component-typed props generate as
 * `Node<"type">`/`Node` (see {@see ComponentTransformer}), and `WireNode` aliases it,
 * so the flat module references `Node` but never defines it. The core↔generated
 * import cycle is type-only, so it erases at runtime.
 */
final class NodeModuleWriter extends FlatModuleWriter
{
    private const string HEADER = 'import type { Node } from "@lattice-php/lattice/core/types";'."\n";

    /**
     * @param  array<mixed>  $transformed
     * @return array<WriteableFile>
     */
    #[\Override]
    public function output(array $transformed, TransformedCollection $transformedCollection): array
    {
        return array_map(
            fn (WriteableFile $file): WriteableFile => new WriteableFile(
                $file->path,
                self::HEADER.$file->contents,
                $file->changed,
            ),
            parent::output($transformed, $transformedCollection),
        );
    }
}
