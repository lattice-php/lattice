<?php

declare(strict_types=1);

namespace Workbench\App\Forms;

use Bambamboole\Lattice\Attributes\Form;
use Bambamboole\Lattice\Components\Core\Card;
use Bambamboole\Lattice\Components\Core\Grid;
use Bambamboole\Lattice\Components\Form\Choice;
use Bambamboole\Lattice\Components\Form\Form as FormComponent;
use Bambamboole\Lattice\Components\Form\TextInput;
use Bambamboole\Lattice\Forms\FormDefinition;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
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
                Card::make('Product details')->children([
                    TextInput::make('name', 'Name')
                        ->rules(['required', 'string', 'max:255']),
                    Grid::make()->columns(2)->children([
                        TextInput::make('sku', 'SKU')
                            ->rules(['required', 'string', 'max:255', Rule::unique(Product::class, 'sku')->ignore($product)]),
                        TextInput::make('price', 'Price')
                            ->rules(['required', 'numeric', 'min:0']),
                    ]),
                    Choice::make('status', 'Status')
                        ->options([
                            Choice::option('Draft', 'draft'),
                            Choice::option('Active', 'active'),
                            Choice::option('Archived', 'archived'),
                        ])
                        ->rules(['required', 'string', Rule::in(['draft', 'active', 'archived'])]),
                ]),
            ]);
    }

    public function handle(Request $request): Response
    {
        $product = $this->product($request);
        $validated = $this->validate($request);

        if (! $product instanceof Product) {
            Product::query()->create($validated);

            return redirect('/products');
        }

        $product->update($validated);

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
