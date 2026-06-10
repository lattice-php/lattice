<?php

declare(strict_types=1);

namespace Workbench\App\Providers;

use Lattice\Lattice\Actions\Components\Action;
use Lattice\Lattice\Actions\Components\ActionGroup;
use Lattice\Lattice\Actions\Components\BulkAction;
use Lattice\Lattice\Actions\Contracts\Effect;
use Lattice\Lattice\Actions\Enums\EffectType;
use Lattice\Lattice\Core\Components\Badge;
use Lattice\Lattice\Core\Components\Button;
use Lattice\Lattice\Core\Components\Card;
use Lattice\Lattice\Core\Components\Grid;
use Lattice\Lattice\Core\Components\Heading;
use Lattice\Lattice\Core\Components\Link;
use Lattice\Lattice\Core\Components\Modal;
use Lattice\Lattice\Core\Components\SegmentedControl;
use Lattice\Lattice\Core\Components\Stack;
use Lattice\Lattice\Core\Components\Tab;
use Lattice\Lattice\Core\Components\Tabs;
use Lattice\Lattice\Core\Components\Text;
use Lattice\Lattice\Core\Enums\Align;
use Lattice\Lattice\Core\Enums\Gap;
use Lattice\Lattice\Core\Enums\HttpMethod;
use Lattice\Lattice\Core\Enums\PageContainer;
use Lattice\Lattice\Core\Enums\PageLayout;
use Lattice\Lattice\Core\Enums\ToastVariant;
use Lattice\Lattice\Core\Enums\Width;
use Lattice\Lattice\Forms\Components\Checkbox;
use Lattice\Lattice\Forms\Components\Choice;
use Lattice\Lattice\Forms\Components\DateInput;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Forms\Components\HiddenInput;
use Lattice\Lattice\Forms\Components\NumberInput;
use Lattice\Lattice\Forms\Components\PasswordInput;
use Lattice\Lattice\Forms\Components\RichEditor;
use Lattice\Lattice\Forms\Components\Select;
use Lattice\Lattice\Forms\Components\SubmitButton;
use Lattice\Lattice\Forms\Components\Textarea;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Forms\Enums\ConditionOperator;
use Lattice\Lattice\Fragments\Components\Fragment;
use Lattice\Lattice\Tables\Columns\ColumnData;
use Lattice\Lattice\Tables\Columns\ColumnFilter;
use Lattice\Lattice\Tables\Enums\ColumnType;
use Lattice\Lattice\Tables\Enums\FilterOperator;
use Lattice\Lattice\Tables\Enums\FilterType;
use Lattice\Lattice\Tables\Enums\PaginationType;
use Lattice\Lattice\Tables\Enums\SortDirection;
use Lattice\Lattice\Tables\TableSort;
use Spatie\LaravelTypeScriptTransformer\TypeScriptTransformerApplicationServiceProvider;
use Spatie\TypeScriptTransformer\References\ClassStringReference;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptLiteral;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptObject;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptProperty;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptReference;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptString;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptUnion;
use Spatie\TypeScriptTransformer\TypeScriptTransformerConfigFactory;
use Spatie\TypeScriptTransformer\Writers\FlatModuleWriter;
use Workbench\App\Support\LatticeComponentTransformer;
use Workbench\App\Support\LatticeEnumTransformer;
use Workbench\App\Support\LatticeNodesProvider;
use Workbench\App\Support\LatticeValueObjectTransformer;
use Workbench\App\Support\OxfmtFormatter;

final class TypeScriptTransformerServiceProvider extends TypeScriptTransformerApplicationServiceProvider
{
    protected function configure(TypeScriptTransformerConfigFactory $config): void
    {
        $packageRoot = dirname(__DIR__, 3);

        $formFields = [
            TextInput::class => 'form.text-input',
            Textarea::class => 'form.textarea',
            Select::class => 'form.select',
            Choice::class => 'form.choice',
            Checkbox::class => 'form.checkbox',
            DateInput::class => 'form.date-input',
            NumberInput::class => 'form.number-input',
            PasswordInput::class => 'form.password-input',
            HiddenInput::class => 'form.hidden-input',
            RichEditor::class => 'form.rich-editor',
            SubmitButton::class => 'form.submit-button',
        ];

        $coreComponents = [
            Badge::class => ['type' => 'badge'],
            Button::class => ['type' => 'button'],
            Card::class => ['type' => 'card', 'container' => true],
            Grid::class => ['type' => 'grid', 'container' => true],
            Heading::class => ['type' => 'heading'],
            Link::class => ['type' => 'link'],
            Text::class => ['type' => 'text'],
            Stack::class => ['type' => 'stack', 'container' => true],
            SegmentedControl::class => ['type' => 'segmented-control'],
            Modal::class => ['type' => 'modal', 'container' => true, 'interactive' => true],
            Tab::class => ['type' => 'tab', 'container' => true],
            Tabs::class => ['type' => 'tabs', 'container' => true],
        ];

        $actionComponents = [
            Action::class => ['type' => 'action', 'interactive' => true],
            ActionGroup::class => ['type' => 'action.group', 'container' => true, 'interactive' => true],
            BulkAction::class => ['type' => 'bulkAction', 'interactive' => true],
        ];

        $fragmentComponents = [
            Fragment::class => ['type' => 'fragment', 'container' => true, 'interactive' => true],
        ];

        $optional = fn (string $name): TypeScriptProperty => new TypeScriptProperty($name, new TypeScriptString, isOptional: true);
        $effect = fn (string $type, array $payload = []): TypeScriptObject => new TypeScriptObject([
            new TypeScriptProperty('type', new TypeScriptLiteral($type)),
            ...$payload,
        ]);

        $effectType = new TypeScriptUnion([
            $effect('toast', [
                $optional('message'),
                new TypeScriptProperty('variant', new TypeScriptReference(new ClassStringReference(ToastVariant::class)), isOptional: true),
            ]),
            $effect('reloadComponent', [$optional('component')]),
            $effect('reloadPage'),
            $effect('redirect', [$optional('url')]),
            $effect('download', [$optional('url')]),
            $effect('openModal', [$optional('modal')]),
            $effect('closeModal', [$optional('modal')]),
            $effect('resetForm', [$optional('form')]),
        ]);

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
                ColumnType::class,
                FilterType::class,
                FilterOperator::class,
                SortDirection::class,
                ConditionOperator::class,
                EffectType::class,
            ]))
            ->transformer(new LatticeValueObjectTransformer([
                ColumnData::class,
                ColumnFilter::class,
                TableSort::class,
            ]))
            ->transformer(new LatticeComponentTransformer([
                ...array_keys($formFields),
                Form::class,
                ...array_keys($coreComponents),
                ...array_keys($actionComponents),
                ...array_keys($fragmentComponents),
            ]))
            ->provider(new LatticeNodesProvider(
                $formFields,
                Form::class,
                $coreComponents,
                $actionComponents,
                $fragmentComponents,
                'form',
                Effect::class,
                $effectType,
            ))
            ->transformDirectories($packageRoot.'/src')
            ->outputDirectory($packageRoot.'/resources/js/generated')
            ->writer(new FlatModuleWriter('types.ts'))
            ->formatter(new OxfmtFormatter);
    }
}
