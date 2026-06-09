<?php

declare(strict_types=1);

namespace Workbench\App\Providers;

use Bambamboole\Lattice\Actions\Enums\EffectType;
use Bambamboole\Lattice\Core\Enums\Align;
use Bambamboole\Lattice\Core\Enums\Gap;
use Bambamboole\Lattice\Core\Enums\HttpMethod;
use Bambamboole\Lattice\Core\Enums\PageContainer;
use Bambamboole\Lattice\Core\Enums\PageLayout;
use Bambamboole\Lattice\Core\Enums\ToastType;
use Bambamboole\Lattice\Core\Enums\Width;
use Bambamboole\Lattice\Forms\Enums\Op;
use Bambamboole\Lattice\Tables\Enums\PaginationType;
use Spatie\LaravelTypeScriptTransformer\TypeScriptTransformerApplicationServiceProvider;
use Spatie\TypeScriptTransformer\TypeScriptTransformerConfigFactory;
use Spatie\TypeScriptTransformer\Writers\FlatModuleWriter;
use Workbench\App\Support\LatticeEnumTransformer;

final class TypeScriptTransformerServiceProvider extends TypeScriptTransformerApplicationServiceProvider
{
    protected function configure(TypeScriptTransformerConfigFactory $config): void
    {
        $packageRoot = dirname(__DIR__, 3);

        $config
            ->transformer(new LatticeEnumTransformer([
                Align::class,
                Gap::class,
                Width::class,
                PageLayout::class,
                PageContainer::class,
                ToastType::class,
                HttpMethod::class,
                PaginationType::class,
                Op::class,
                EffectType::class,
            ]))
            ->transformDirectories($packageRoot.'/src')
            ->outputDirectory($packageRoot.'/resources/js/generated')
            ->writer(new FlatModuleWriter('enums.ts'));
    }
}
