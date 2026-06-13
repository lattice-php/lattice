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
                Card::make('Line items')->schema([
                    Builder::make('items', 'Line items')
                        ->blocks([
                            Block::make('text')->label('Text')->schema([
                                Textarea::make('content', 'Content')->required(),
                            ]),
                            Block::make('product')->label('Product line')->schema([
                                TextInput::make('product', 'Product')->required(),
                                TextInput::make('qty', 'Qty')->rules(['numeric']),
                                TextInput::make('price', 'Price')->rules(['numeric']),
                            ]),
                        ])
                        ->minItems(1)
                        ->addLabel('Add block'),
                ]),
            ]);
    }

    public function handle(Request $request): Response
    {
        $this->validate($request);

        return redirect('/builder');
    }
}
