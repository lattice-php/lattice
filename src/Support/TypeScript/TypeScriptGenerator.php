<?php

declare(strict_types=1);

namespace Lattice\Lattice\Support\TypeScript;

use Illuminate\Support\Facades\File;
use Spatie\TypeScriptTransformer\Formatters\Formatter;
use Spatie\TypeScriptTransformer\TransformedProviders\TransformedProvider;
use Spatie\TypeScriptTransformer\Transformers\Transformer;
use Spatie\TypeScriptTransformer\TypeScriptTransformer;
use Spatie\TypeScriptTransformer\TypeScriptTransformerConfigFactory;
use Spatie\TypeScriptTransformer\Writers\Writer;

/**
 * Single entry point for both type-generation passes: the built-in pass over the
 * package `src/` (flat module) and the app pass over the configured discover roots
 * (interface augmentation). Each pass differs only in its roots, transformers,
 * provider, writer and output directory.
 */
final class TypeScriptGenerator
{
    /**
     * @param  list<string>  $directories
     * @param  list<Transformer>  $transformers
     * @param  list<TransformedProvider>  $providers
     */
    public function generate(
        array $directories,
        array $transformers,
        array $providers,
        Writer $writer,
        string $outputDirectory,
        ?Formatter $formatter = null,
    ): void {
        File::ensureDirectoryExists($outputDirectory);

        $factory = TypeScriptTransformerConfigFactory::create()
            ->transformer(...$transformers)
            ->transformDirectories(...$directories)
            ->outputDirectory($outputDirectory)
            ->writer($writer);

        if ($providers !== []) {
            $factory->provider(...$providers);
        }

        if ($formatter instanceof Formatter) {
            $factory->formatter($formatter);
        }

        TypeScriptTransformer::create($factory->get())->execute();
    }
}
