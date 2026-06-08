<?php

declare(strict_types=1);

namespace Workbench\App\Forms;

use Bambamboole\Lattice\Attributes\Form;
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
        return $form
            ->precognitive(2650)
            ->schema([
                TextInput::make('name', 'Name')
                    ->required(),
                TextInput::make('sku', 'SKU')
                    ->required(),
                TextInput::make('price', 'Price')
                    ->required(),
                Choice::make('status', 'Status')
                    ->options([
                        Choice::option('Draft', 'draft'),
                        Choice::option('Active', 'active'),
                        Choice::option('Archived', 'archived'),
                    ]),
            ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(Request $request): array
    {
        $product = $this->product($request);

        return [
            'name' => ['required', 'string', 'max:255'],
            'sku' => [
                'required',
                'string',
                'max:255',
                Rule::unique(Product::class, 'sku')->ignore($product),
            ],
            'price' => ['required', 'numeric', 'min:0'],
            'status' => ['required', 'string', Rule::in(['draft', 'active', 'archived'])],
        ];
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
