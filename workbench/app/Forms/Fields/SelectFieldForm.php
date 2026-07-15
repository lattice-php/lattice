<?php
declare(strict_types=1);

namespace Workbench\App\Forms\Fields;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Lattice\Lattice\Attributes\AsForm;
use Lattice\Lattice\Core\EloquentOptions;
use Lattice\Lattice\Core\Option;
use Lattice\Lattice\Forms\Components\Form as FormComponent;
use Lattice\Lattice\Forms\Components\Select;
use Lattice\Lattice\Forms\FormDefinition;
use Lattice\Lattice\Ui\Components\Badge;
use Lattice\Lattice\Ui\Components\Stack;
use Lattice\Lattice\Ui\Components\Tab;
use Lattice\Lattice\Ui\Components\Tabs;
use Lattice\Lattice\Ui\Components\Text;
use Lattice\Lattice\Ui\Enums\Color;
use Lattice\Lattice\Ui\Enums\Orientation;
use Lattice\Lattice\Ui\Enums\Size;
use Symfony\Component\HttpFoundation\Response;
use Workbench\App\Models\Product;

#[AsForm('workbench.fields.select.form')]
class SelectFieldForm extends FormDefinition
{
    public function definition(FormComponent $form, Request $request): FormComponent
    {
        return $form->schema([
            Tabs::make('select-variants')
                ->queryKey('type')
                ->orientation(Orientation::Vertical)
                ->defaultValue('basic')
                ->schema([
                    Tab::make('basic', __('workbench.fields.variants.basic'))->schema([
                        Select::make('country', __('workbench.forms.showcase.country'))
                            ->placeholder(__('workbench.forms.showcase.pick-country'))
                            ->options([
                                Select::option(__('workbench.forms.showcase.germany'), 'de'),
                                Select::option(__('workbench.forms.showcase.france'), 'fr'),
                                Select::option(__('workbench.forms.showcase.spain'), 'es'),
                                Select::option(__('workbench.forms.showcase.italy'), 'it'),
                            ])
                            ->rules(['nullable', 'string']),
                    ]),
                    Tab::make('multiple', __('workbench.fields.select.multiple'))->schema([
                        Select::make('interests', __('workbench.fields.select.interests'))
                            ->multiple()
                            ->options([
                                Select::option(__('workbench.fields.select.design'), 'design'),
                                Select::option(__('workbench.fields.select.engineering'), 'engineering'),
                                Select::option(__('workbench.fields.select.sales'), 'sales'),
                            ])
                            ->rules(['nullable', 'array']),
                    ]),
                    Tab::make('searchable', __('workbench.fields.select.searchable'))->schema([
                        Select::make('related_products', __('workbench.forms.product.fields.related-products'))
                            ->multiple()
                            ->placeholder(__('workbench.common.search-products'))
                            ->searchable(fn (string $search) => Product::query()
                                ->where('name', 'like', "%{$search}%")
                                ->orderBy('name')
                                ->limit(10)
                                ->get()
                                ->map($this->productOption(...))
                                ->all())
                            ->resolveSelectedUsing(fn (array $values) => Product::query()
                                ->whereIn('id', $values)
                                ->get()
                                ->map($this->productOption(...))
                                ->all())
                            ->optionSchema([
                                Stack::make()->schema([
                                    Text::make('')->dataKey('text', 'label'),
                                    Text::make('')->dataKey('text', 'status')->size(Size::Sm)->color(Color::Muted),
                                ]),
                                Badge::make('')->dataKey('label', 'sku'),
                            ])
                            ->rules(['nullable', 'array']),
                    ]),
                    Tab::make('eloquent', __('workbench.fields.select.eloquent'))->schema([
                        Select::make('product_id', __('workbench.common.product'))
                            ->placeholder(__('workbench.fields.select.pick-product'))
                            ->optionsFrom(
                                EloquentOptions::make(Product::class)
                                    ->label('name')
                                    ->limit(10),
                            )
                            ->rules(['nullable']),
                    ]),
                    Tab::make('creatable', __('workbench.fields.select.creatable'))->schema([
                        Select::make('keywords', __('workbench.fields.select.keywords'))
                            ->multiple()
                            ->creatable()
                            ->itemRules(['string', 'max:40'])
                            ->rules(['nullable', 'array']),
                    ]),
                    Tab::make('tags', __('workbench.fields.select.tags'))->schema([
                        Select::make('topics', __('workbench.fields.select.topics'))
                            ->multiple()
                            ->options([
                                Select::option(__('workbench.fields.select.sales'), 'sales', ['color' => '#3b82f6']),
                                Select::option(__('workbench.fields.select.design'), 'design', ['color' => '#8b5cf6']),
                            ])
                            ->creatable(fn (string $label): Option => Select::option($label, Str::slug($label), ['color' => '#22c55e']))
                            ->rules(['nullable', 'array']),
                    ]),
                ]),
        ]);
    }

    public function handle(Request $request): Response
    {
        $this->validate($request);

        return redirect('/form/fields/select');
    }

    private function productOption(Product $product): Option
    {
        return Select::option(
            $product->name,
            (string) $product->id,
            ['sku' => $product->sku, 'status' => $product->status],
        );
    }
}
