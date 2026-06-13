<?php
declare(strict_types=1);

namespace Workbench\App\Forms;

use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\Form;
use Lattice\Lattice\Core\Components\Card;
use Lattice\Lattice\Forms\Components\Block;
use Lattice\Lattice\Forms\Components\Builder;
use Lattice\Lattice\Forms\Components\Form as FormComponent;
use Lattice\Lattice\Forms\Components\Textarea;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Forms\FormDefinition;
use Symfony\Component\HttpFoundation\Response;

#[Form('workbench.builder.form')]
class BuilderDemoForm extends FormDefinition
{
    public function definition(FormComponent $form, Request $request): FormComponent
    {
        return $form
            ->precognitive(300)
            ->schema([
                Card::make(__('workbench.forms.builder.card'))->schema([
                    Builder::make('items', __('workbench.common.lineItems'))
                        ->blocks([
                            Block::make('text')->label(__('workbench.common.text'))->schema([
                                Textarea::make('content', __('workbench.common.content'))->required(),
                            ]),
                            Block::make('product')->label(__('workbench.common.productLine'))->schema([
                                TextInput::make('product', __('workbench.common.product'))->required(),
                                TextInput::make('qty', __('workbench.common.qty'))->rules(['numeric']),
                                TextInput::make('price', __('workbench.common.price'))->rules(['numeric']),
                            ]),
                        ])
                        ->minItems(1)
                        ->addLabel(__('workbench.common.addBlock')),
                ]),
            ]);
    }

    public function handle(Request $request): Response
    {
        $this->validate($request);

        return redirect('/builder');
    }
}
