<?php

declare(strict_types=1);

namespace Workbench\App\Providers;

use Bambamboole\Lattice\Actions\Enums\EffectType;
use Bambamboole\Lattice\Core\Enums\Align;
use Bambamboole\Lattice\Core\Enums\Gap;
use Bambamboole\Lattice\Core\Enums\HttpMethod;
use Bambamboole\Lattice\Core\Enums\PageContainer;
use Bambamboole\Lattice\Core\Enums\PageLayout;
use Bambamboole\Lattice\Core\Enums\ToastVariant;
use Bambamboole\Lattice\Core\Enums\Width;
use Bambamboole\Lattice\Forms\Enums\Op;
use Bambamboole\Lattice\Tables\Enums\ControlType;
use Bambamboole\Lattice\Tables\Enums\Operator;
use Bambamboole\Lattice\Tables\Enums\PaginationType;
use Bambamboole\Lattice\Tables\Enums\SortDirection;
use Bambamboole\Lattice\Tables\TableSort;
use Spatie\LaravelTypeScriptTransformer\TypeScriptTransformerApplicationServiceProvider;
use Spatie\TypeScriptTransformer\TypeScriptTransformerConfigFactory;
use Spatie\TypeScriptTransformer\Writers\FlatModuleWriter;
use Workbench\App\Support\LatticeEnumTransformer;
use Workbench\App\Support\LatticeValueObjectTransformer;

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
                ToastVariant::class,
                HttpMethod::class,
                PaginationType::class,
                ControlType::class,
                Operator::class,
                SortDirection::class,
                Op::class,
                EffectType::class,
            ]))
            ->transformer(new LatticeValueObjectTransformer([
                TableSort::class,
            ]))
            ->transformDirectories($packageRoot.'/src')
            ->outputDirectory($packageRoot.'/resources/js/generated')
            ->writer(new FlatModuleWriter('types.ts'));
    }
}
