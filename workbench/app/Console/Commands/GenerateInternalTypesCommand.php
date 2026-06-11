<?php

declare(strict_types=1);

namespace Workbench\App\Console\Commands;

use Illuminate\Console\Command;
use Lattice\Lattice\Actions\Contracts\Effect;
use Lattice\Lattice\Actions\Enums\EffectType;
use Lattice\Lattice\Core\Enums\Align;
use Lattice\Lattice\Core\Enums\ButtonVariant;
use Lattice\Lattice\Core\Enums\Gap;
use Lattice\Lattice\Core\Enums\Op;
use Lattice\Lattice\Core\Enums\Orientation;
use Lattice\Lattice\Core\Enums\PageContainer;
use Lattice\Lattice\Core\Enums\PageLayout;
use Lattice\Lattice\Core\Enums\ToastVariant;
use Lattice\Lattice\Core\Enums\Width;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Support\TypeScript\ComponentDiscovery;
use Lattice\Lattice\Support\TypeScript\ComponentTransformer;
use Lattice\Lattice\Support\TypeScript\DiscoveredComponent;
use Lattice\Lattice\Support\TypeScript\EffectType as TypeScriptEffectType;
use Lattice\Lattice\Support\TypeScript\EnumTransformer;
use Lattice\Lattice\Support\TypeScript\HttpMethodTransformer;
use Lattice\Lattice\Support\TypeScript\NodesProvider;
use Lattice\Lattice\Support\TypeScript\OxfmtFormatter;
use Lattice\Lattice\Support\TypeScript\TypeScriptGenerator;
use Lattice\Lattice\Support\TypeScript\ValueObjectTransformer;
use Lattice\Lattice\Tables\Columns\ColumnData;
use Lattice\Lattice\Tables\Columns\ColumnFilter;
use Lattice\Lattice\Tables\Enums\ColumnType;
use Lattice\Lattice\Tables\Enums\FilterType;
use Lattice\Lattice\Tables\Enums\PaginationType;
use Lattice\Lattice\Tables\Enums\SortDirection;
use Lattice\Lattice\Tables\FilterClause;
use Lattice\Lattice\Tables\TableSort;
use Spatie\TypeScriptTransformer\Writers\FlatModuleWriter;

final class GenerateInternalTypesCommand extends Command
{
    protected $signature = 'lattice:internal-types';

    protected $description = "Regenerate Lattice's built-in TypeScript types (resources/js/types/generated.ts)";

    public function handle(TypeScriptGenerator $generator): int
    {
        $packageRoot = dirname(__DIR__, 4);
        $src = $packageRoot.'/src';

        $discovered = (new ComponentDiscovery)->discover($src);

        $formFields = $this->buildFormFields($discovered);
        $coreComponents = $this->buildBucket($discovered, 'Lattice\\Lattice\\Core\\Components\\');
        $actionComponents = $this->buildBucket($discovered, 'Lattice\\Lattice\\Actions\\Components\\');
        $fragmentComponents = $this->buildBucket($discovered, 'Lattice\\Lattice\\Fragments\\Components\\');
        $tableComponents = $this->buildBucket($discovered, 'Lattice\\Lattice\\Tables\\Components\\');
        $layoutComponents = $this->buildBucket($discovered, 'Lattice\\Lattice\\Layouts\\Components\\');

        $generator->generate(
            [$src],
            [
                new HttpMethodTransformer,
                new EnumTransformer([
                    Align::class,
                    ButtonVariant::class,
                    Gap::class,
                    Width::class,
                    PageLayout::class,
                    PageContainer::class,
                    Orientation::class,
                    ToastVariant::class,
                    PaginationType::class,
                    ColumnType::class,
                    FilterType::class,
                    Op::class,
                    SortDirection::class,
                    EffectType::class,
                ]),
                new ValueObjectTransformer([
                    ColumnData::class,
                    ColumnFilter::class,
                    FilterClause::class,
                    TableSort::class,
                ]),
                new ComponentTransformer([
                    ...array_keys($formFields),
                    Form::class,
                    ...array_keys($coreComponents),
                    ...array_keys($actionComponents),
                    ...array_keys($fragmentComponents),
                    ...array_keys($tableComponents),
                    ...array_keys($layoutComponents),
                ]),
            ],
            [
                new NodesProvider(
                    $formFields,
                    Form::class,
                    $coreComponents,
                    $actionComponents,
                    $fragmentComponents,
                    $tableComponents,
                    $layoutComponents,
                    'form',
                    Effect::class,
                    TypeScriptEffectType::build(),
                ),
            ],
            new FlatModuleWriter('generated.ts'),
            $packageRoot.'/resources/js/types',
            new OxfmtFormatter,
        );

        $this->components->info('Regenerated built-in TypeScript types.');

        return self::SUCCESS;
    }

    /**
     * @param  list<DiscoveredComponent>  $discovered
     * @return array<class-string, string>
     */
    private function buildFormFields(array $discovered): array
    {
        $prefix = 'Lattice\\Lattice\\Forms\\Components\\';

        $fields = array_filter(
            $discovered,
            fn (DiscoveredComponent $dc): bool => str_starts_with($dc->class, $prefix)
                && $dc->class !== Form::class,
        );

        usort($fields, fn (DiscoveredComponent $a, DiscoveredComponent $b): int => $a->type <=> $b->type);

        return array_column(
            array_map(fn (DiscoveredComponent $dc): array => [$dc->class, $dc->type], $fields),
            1,
            0,
        );
    }

    /**
     * @param  list<DiscoveredComponent>  $discovered
     * @return array<class-string, array{type: string, container?: bool, interactive?: bool}>
     */
    private function buildBucket(array $discovered, string $prefix): array
    {
        $components = array_filter(
            $discovered,
            fn (DiscoveredComponent $dc): bool => str_starts_with($dc->class, $prefix),
        );

        usort($components, fn (DiscoveredComponent $a, DiscoveredComponent $b): int => $a->type <=> $b->type);

        $result = [];

        foreach ($components as $dc) {
            $spec = ['type' => $dc->type];

            if ($dc->container) {
                $spec['container'] = true;
            }

            if ($dc->interactive) {
                $spec['interactive'] = true;
            }

            $result[$dc->class] = $spec;
        }

        return $result;
    }
}
