<?php

declare(strict_types=1);

namespace Workbench\App\Providers;

use Lattice\Lattice\Actions\Enums\EffectType;
use Lattice\Lattice\Core\Enums\Align;
use Lattice\Lattice\Core\Enums\Gap;
use Lattice\Lattice\Core\Enums\HttpMethod;
use Lattice\Lattice\Core\Enums\PageContainer;
use Lattice\Lattice\Core\Enums\PageLayout;
use Lattice\Lattice\Core\Enums\ToastVariant;
use Lattice\Lattice\Core\Enums\Width;
use Lattice\Lattice\Forms\Enums\ConditionOperator;
use Lattice\Lattice\Tables\Enums\ControlType;
use Lattice\Lattice\Tables\Enums\FilterOperator;
use Lattice\Lattice\Tables\Enums\PaginationType;
use Lattice\Lattice\Tables\Enums\SortDirection;
use Lattice\Lattice\Tables\TableSort;
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
                FilterOperator::class,
                SortDirection::class,
                ConditionOperator::class,
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
