<?php

declare(strict_types=1);

namespace Workbench\App\Providers;

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
use Lattice\Lattice\Support\TypeScript\DiscoveredComponent;
use Lattice\Lattice\Support\TypeScript\LatticeComponentTransformer;
use Lattice\Lattice\Support\TypeScript\LatticeEffectType;
use Lattice\Lattice\Support\TypeScript\LatticeEnumTransformer;
use Lattice\Lattice\Support\TypeScript\LatticeHttpMethodTransformer;
use Lattice\Lattice\Support\TypeScript\LatticeNodesProvider;
use Lattice\Lattice\Support\TypeScript\LatticeValueObjectTransformer;
use Lattice\Lattice\Support\TypeScript\OxfmtFormatter;
use Lattice\Lattice\Tables\Columns\ColumnData;
use Lattice\Lattice\Tables\Columns\ColumnFilter;
use Lattice\Lattice\Tables\Enums\ColumnType;
use Lattice\Lattice\Tables\Enums\FilterType;
use Lattice\Lattice\Tables\Enums\PaginationType;
use Lattice\Lattice\Tables\Enums\SortDirection;
use Lattice\Lattice\Tables\FilterClause;
use Lattice\Lattice\Tables\TableSort;
use Spatie\LaravelTypeScriptTransformer\TypeScriptTransformerApplicationServiceProvider;
use Spatie\TypeScriptTransformer\TypeScriptTransformerConfigFactory;
use Spatie\TypeScriptTransformer\Writers\FlatModuleWriter;

final class TypeScriptTransformerServiceProvider extends TypeScriptTransformerApplicationServiceProvider
{
    /**
     * Pin the member order of the generated TypeScript `Node` union so output stays
     * deterministic. Every built-in component in the matching namespace bucket MUST
     * appear in exactly one of these lists. The guard test in
     * tests/Feature/TypeScript/ComponentOrderingTest.php enforces this constraint.
     */
    private const FORM_FIELD_ORDER = [
        'form.text-input', 'form.textarea', 'form.select', 'form.choice', 'form.checkbox',
        'form.date-input', 'form.number-input', 'form.password-input', 'form.hidden-input',
        'form.rich-editor', 'form.submit-button',
    ];

    /** @see self::FORM_FIELD_ORDER */
    private const CORE_ORDER = [
        'badge', 'button', 'card', 'grid', 'heading', 'link', 'text', 'stack',
        'segmented-control', 'modal', 'tab', 'tabs',
    ];

    /** @see self::FORM_FIELD_ORDER */
    private const ACTION_ORDER = ['action', 'action.group', 'bulkAction'];

    /** @see self::FORM_FIELD_ORDER */
    private const FRAGMENT_ORDER = ['fragment'];

    /** @see self::FORM_FIELD_ORDER */
    private const TABLE_ORDER = ['table'];

    /** @see self::FORM_FIELD_ORDER */
    private const LAYOUT_ORDER = ['outlet', 'menu', 'menu-item'];

    /**
     * All built-in component types that are tracked by an ORDER constant, plus the
     * Form container type that is wired separately. Used by the ordering guard test
     * to assert that every discovered built-in type is accounted for.
     *
     * @return list<string>
     */
    public static function knownOrderedTypes(): array
    {
        return [
            ...self::FORM_FIELD_ORDER,
            'form',
            ...self::CORE_ORDER,
            ...self::ACTION_ORDER,
            ...self::FRAGMENT_ORDER,
            ...self::TABLE_ORDER,
            ...self::LAYOUT_ORDER,
        ];
    }

    protected function configure(TypeScriptTransformerConfigFactory $config): void
    {
        $packageRoot = dirname(__DIR__, 3);

        $discovered = (new ComponentDiscovery)->discover($packageRoot.'/src', 'Lattice\\Lattice');

        $formFields = $this->buildFormFields($discovered);
        $coreComponents = $this->buildBucket($discovered, 'Lattice\\Lattice\\Core\\Components\\', self::CORE_ORDER);
        $actionComponents = $this->buildBucket($discovered, 'Lattice\\Lattice\\Actions\\Components\\', self::ACTION_ORDER);
        $fragmentComponents = $this->buildBucket($discovered, 'Lattice\\Lattice\\Fragments\\Components\\', self::FRAGMENT_ORDER);
        $tableComponents = $this->buildBucket($discovered, 'Lattice\\Lattice\\Tables\\Components\\', self::TABLE_ORDER);
        $layoutComponents = $this->buildBucket($discovered, 'Lattice\\Lattice\\Layouts\\Components\\', self::LAYOUT_ORDER);

        $config
            ->transformer(new LatticeHttpMethodTransformer)
            ->transformer(new LatticeEnumTransformer([
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
            ]))
            ->transformer(new LatticeValueObjectTransformer([
                ColumnData::class,
                ColumnFilter::class,
                FilterClause::class,
                TableSort::class,
            ]))
            ->transformer(new LatticeComponentTransformer([
                ...array_keys($formFields),
                Form::class,
                ...array_keys($coreComponents),
                ...array_keys($actionComponents),
                ...array_keys($fragmentComponents),
                ...array_keys($tableComponents),
                ...array_keys($layoutComponents),
            ]))
            ->provider(new LatticeNodesProvider(
                $formFields,
                Form::class,
                $coreComponents,
                $actionComponents,
                $fragmentComponents,
                $tableComponents,
                $layoutComponents,
                'form',
                Effect::class,
                LatticeEffectType::build(),
            ))
            ->transformDirectories($packageRoot.'/src')
            ->outputDirectory($packageRoot.'/resources/js/types')
            ->writer(new FlatModuleWriter('generated.ts'))
            ->formatter(new OxfmtFormatter);
    }

    /**
     * Build the form-fields map (class => type) from discovered components
     * in the Forms\Components namespace, excluding Form itself.
     *
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

        usort($fields, $this->orderComparator(self::FORM_FIELD_ORDER));

        return array_column(
            array_map(fn (DiscoveredComponent $dc): array => [$dc->class, $dc->type], $fields),
            1,
            0,
        );
    }

    /**
     * Build a component-spec map (class => ['type' => ..., ...]) for a namespace bucket.
     *
     * @param  list<DiscoveredComponent>  $discovered
     * @param  list<string>  $order
     * @return array<class-string, array{type: string, container?: bool, interactive?: bool}>
     */
    private function buildBucket(array $discovered, string $prefix, array $order): array
    {
        $components = array_filter(
            $discovered,
            fn (DiscoveredComponent $dc): bool => str_starts_with($dc->class, $prefix),
        );

        usort($components, $this->orderComparator($order));

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

    /**
     * Returns a usort comparator that sorts DiscoveredComponents by their position
     * in the given ordered list, placing unrecognised types last.
     *
     * @param  list<string>  $order
     * @return callable(DiscoveredComponent, DiscoveredComponent): int
     */
    private function orderComparator(array $order): callable
    {
        return function (DiscoveredComponent $a, DiscoveredComponent $b) use ($order): int {
            $posA = array_search($a->type, $order, true);
            $posB = array_search($b->type, $order, true);

            return ($posA === false ? PHP_INT_MAX : $posA)
                <=> ($posB === false ? PHP_INT_MAX : $posB);
        };
    }
}
