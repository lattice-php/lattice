<?php

declare(strict_types=1);

namespace Workbench\App\Providers;

use Bambamboole\Lattice\Actions\EffectType;
use Bambamboole\Lattice\Core\Align;
use Bambamboole\Lattice\Core\Gap;
use Bambamboole\Lattice\Core\HttpMethod;
use Bambamboole\Lattice\Core\Width;
use Bambamboole\Lattice\Forms\Conditions\Op;
use Bambamboole\Lattice\Pages\PageContainer;
use Bambamboole\Lattice\Pages\PageLayout;
use Bambamboole\Lattice\Tables\PaginationType;
use Bambamboole\Lattice\Toasts\ToastType;
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
