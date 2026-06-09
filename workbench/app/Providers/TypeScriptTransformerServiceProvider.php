<?php

declare(strict_types=1);

namespace Workbench\App\Providers;

use Bambamboole\Lattice\Actions\EffectType;
use Bambamboole\Lattice\Enums\Align;
use Bambamboole\Lattice\Enums\Gap;
use Bambamboole\Lattice\Enums\HttpMethod;
use Bambamboole\Lattice\Enums\PageContainer;
use Bambamboole\Lattice\Enums\PageLayout;
use Bambamboole\Lattice\Enums\ToastType;
use Bambamboole\Lattice\Enums\Width;
use Bambamboole\Lattice\Forms\Conditions\Op;
use Bambamboole\Lattice\Tables\PaginationType;
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
            ->transformDirectories(
                $packageRoot.'/src/Enums',
                $packageRoot.'/src/Forms/Conditions',
                $packageRoot.'/src/Tables',
                $packageRoot.'/src/Actions',
            )
            ->outputDirectory($packageRoot.'/resources/js/generated')
            ->writer(new FlatModuleWriter('enums.ts'));
    }
}
