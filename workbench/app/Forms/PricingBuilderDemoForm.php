<?php
declare(strict_types=1);

namespace Workbench\App\Forms;

use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\Form;
use Lattice\Lattice\Core\Components\Card;
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
        $products = Product::query()->orderBy('name')->limit(20)->get();

        return $form
            ->precognitive(300)
            ->schema([
                Card::make('Customer')->schema([
                    Select::make('customer', 'Customer')->options([
                        Select::option('Acme', 'acme'),
                        Select::option('Globex (10% off)', 'globex'),
                        Select::option('Initech (25% off)', 'initech'),
                    ]),
                ]),
                Card::make('Line items')->schema([
                    Builder::make('items', 'Line items')
                        ->blocks([
                            Block::make('text')->label('Text')->schema([
                                Textarea::make('content', 'Content')->required(),
                            ]),
                            Block::make('product')->label('Product line')->schema([
                                Select::make('product', 'Product')->options(
                                    $products
                                        ->map(fn (Product $product) => Select::option($product->name, (string) $product->getKey()))
                                        ->all(),
                                ),
                                TextInput::make('qty', 'Qty')->rules(['numeric']),
                                TextInput::make('price', 'Price')->rules(['numeric'])->value(
                                    fn (FormData $row, FormData $form) => $this->priceFor($row->get('product'), $form->get('customer')),
                                    editable: true,
                                    resetOn: ['product'],
                                    refreshOn: ['@customer'],
                                ),
                            ]),
                        ])
                        ->minItems(1)
                        ->addLabel('Add block'),
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
