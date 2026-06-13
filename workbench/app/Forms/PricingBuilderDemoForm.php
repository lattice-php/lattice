<?php
declare(strict_types=1);

namespace Workbench\App\Forms;

use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\Form;
use Lattice\Lattice\Core\Components\Card;
use Lattice\Lattice\Core\Option;
use Lattice\Lattice\Forms\Components\Block;
use Lattice\Lattice\Forms\Components\Builder;
use Lattice\Lattice\Forms\Components\Form as FormComponent;
use Lattice\Lattice\Forms\Components\Select;
use Lattice\Lattice\Forms\Components\Textarea;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Forms\FormData;
use Lattice\Lattice\Forms\FormDefinition;
use Symfony\Component\HttpFoundation\Response;
use Workbench\App\Models\Product;

#[Form('workbench.pricing-builder.form')]
class PricingBuilderDemoForm extends FormDefinition
{
    /**
     * @var array<string, float>
     */
    private const CUSTOMER_DISCOUNTS = ['acme' => 0.0, 'globex' => 0.10, 'initech' => 0.25];

    public function definition(FormComponent $form, Request $request): FormComponent
    {
        return $form
            ->precognitive(300)
            ->schema([
                Card::make(__('workbench.forms.pricing-builder.customer'))->schema([
                    Select::make('customer', __('workbench.forms.pricing-builder.customer'))->options([
                        Select::option(__('workbench.forms.pricing-builder.acme'), 'acme'),
                        Select::option(__('workbench.forms.pricing-builder.globex'), 'globex'),
                        Select::option(__('workbench.forms.pricing-builder.initech'), 'initech'),
                    ]),
                ]),
                Card::make(__('workbench.common.line-items'))->schema([
                    Builder::make('items', __('workbench.common.line-items'))
                        ->blocks([
                            Block::make('text')->label(__('workbench.common.text'))->schema([
                                Textarea::make('content', __('workbench.common.content'))->required(),
                            ]),
                            Block::make('product')->label(__('workbench.common.product-line'))->schema([
                                Select::make('product', __('workbench.common.product'))
                                    ->options($this->productOptions(limit: 20))
                                    ->searchable(fn (string $search) => $this->productOptions(query: $search, limit: 10))
                                    ->resolveSelectedUsing(fn (array $values) => $this->productOptions(values: $values)),
                                TextInput::make('qty', __('workbench.common.qty'))->rules(['numeric']),
                                TextInput::make('price', __('workbench.common.price'))->rules(['numeric'])->value(
                                    fn (FormData $row, FormData $form) => $this->priceFor($row->get('product'), $form->get('customer')),
                                    editable: true,
                                    resetOn: ['product'],
                                    refreshOn: ['@customer'],
                                ),
                                TextInput::make('discount_note', __('workbench.forms.pricing-builder.discount-note'))
                                    ->visibleWhen('product', '!=', ''),
                            ]),
                        ])
                        ->minItems(1)
                        ->addLabel(__('workbench.common.add-block')),
                ]),
            ]);
    }

    public function handle(Request $request): Response
    {
        // The submitted price is the client value (an editable default is user-owned).
        // A real form needing trusted pricing would re-derive it from product + customer here.
        $this->validate($request);

        return redirect('/builder-pricing');
    }

    /**
     * @param  array<int, string>|null  $values
     * @return array<int, Option>
     */
    private function productOptions(?string $query = null, ?array $values = null, ?int $limit = null): array
    {
        $builder = Product::query()->orderBy('name');

        if ($query !== null) {
            $builder->where('name', 'like', "%{$query}%");
        }

        if ($values !== null) {
            $builder->whereIn('id', $values);
        }

        if ($limit !== null) {
            $builder->limit($limit);
        }

        return $builder
            ->get()
            ->map(fn (Product $product) => Select::option($product->name, (string) $product->getKey()))
            ->all();
    }

    private function priceFor(mixed $productId, mixed $customer): ?float
    {
        if (blank($productId)) {
            return null;
        }

        $product = Product::find($productId);

        if ($product === null) {
            return null;
        }

        $discount = self::CUSTOMER_DISCOUNTS[is_string($customer) ? $customer : ''] ?? 0.0;

        return round((float) $product->price * (1 - $discount), 2);
    }
}
