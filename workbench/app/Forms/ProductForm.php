<?php
declare(strict_types=1);

namespace Workbench\App\Forms;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Lattice\Lattice\Attributes\Form;
use Lattice\Lattice\Core\Components\Card;
use Lattice\Lattice\Core\Components\Grid;
use Lattice\Lattice\Forms\Components\Choice;
use Lattice\Lattice\Forms\Components\Form as FormComponent;
use Lattice\Lattice\Forms\Components\Select;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Forms\FormDefinition;
use Symfony\Component\HttpFoundation\Response;
use Workbench\App\Models\Product;

#[Form('workbench.products.form')]
class ProductForm extends FormDefinition
{
    public function definition(FormComponent $form, Request $request): FormComponent
    {
        $product = $this->product($request);

        return $form
            ->precognitive(2650)
            ->schema([
                Card::make(__('workbench.forms.product.card'))->schema([
                    TextInput::make('name', __('workbench.forms.product.fields.name'))
                        ->rules(['required', 'string', 'max:255']),
                    Grid::make()->columns(2)->schema([
                        TextInput::make('sku', __('workbench.forms.product.fields.sku'))
                            ->rules(['required', 'string', 'max:255', Rule::unique(Product::class, 'sku')->ignore($product)]),
                        TextInput::make('price', __('workbench.forms.product.fields.price'))
                            ->rules(['required', 'numeric', 'min:0']),
                    ]),
                    Choice::make('status', __('workbench.forms.product.fields.status'))
                        ->options([
                            Choice::option(__('workbench.forms.product.status.draft'), 'draft'),
                            Choice::option(__('workbench.forms.product.status.active'), 'active'),
                            Choice::option(__('workbench.forms.product.status.archived'), 'archived'),
                        ])
                        ->rules(['required', 'string', Rule::in(['draft', 'active', 'archived'])]),
                    Select::make('related_products', __('workbench.forms.product.fields.relatedProducts'))
                        ->multiple()
                        ->placeholder(__('workbench.common.searchProducts'))
                        ->searchable(fn (string $query) => Product::query()
                            ->where('name', 'like', "%{$query}%")
                            ->when($product, fn ($builder) => $builder->whereKeyNot($product->getKey()))
                            ->orderBy('name')
                            ->limit(10)
                            ->get()
                            ->map(fn (Product $related) => Select::option($related->name, (string) $related->getKey()))
                            ->all())
                        ->resolveSelectedUsing(fn (array $values) => Product::query()
                            ->whereIn('id', $values)
                            ->get()
                            ->map(fn (Product $related) => Select::option($related->name, (string) $related->getKey()))
                            ->all())
                        ->rules(['nullable', 'array']),
                ]),
            ]);
    }

    public function handle(Request $request): Response
    {
        $product = $this->product($request);
        $validated = $this->validate($request);

        $relatedIds = $validated['related_products'] ?? [];
        unset($validated['related_products']);

        if (! $product instanceof Product) {
            $product = Product::query()->create($validated);
        } else {
            $product->update($validated);
        }

        $product->relatedProducts()->sync(
            Product::query()->whereIn('id', $relatedIds)->pluck('id')->all(),
        );

        return redirect('/products');
    }

    private function product(Request $request): ?Product
    {
        $id = $this->context($request, 'product_id');

        if ($id === null || $id === '') {
            return null;
        }

        return Product::query()->findOrFail($id);
    }
}
