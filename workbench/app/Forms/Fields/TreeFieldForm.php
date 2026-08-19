<?php
declare(strict_types=1);

namespace Workbench\App\Forms\Fields;

use Illuminate\Http\Request;
use Lattice\Form\Attributes\AsForm;
use Lattice\Form\Components\Form as FormComponent;
use Lattice\Form\Components\RowTemplate;
use Lattice\Form\Components\Textarea;
use Lattice\Form\Components\TextInput;
use Lattice\Form\FormDefinition;
use Lattice\Tree\Forms\Components\TreeField;
use Symfony\Component\HttpFoundation\Response;

#[AsForm('workbench.fields.tree.form')]
class TreeFieldForm extends FormDefinition
{
    public function definition(FormComponent $form, Request $request): FormComponent
    {
        return $form->resetOnSuccess()->schema([
            TreeField::make('items', __('workbench.common.line-items'))
                ->maxDepth(2)
                ->acceptsChildrenFor(['heading', 'product'])
                ->templates([
                    RowTemplate::make('heading')->label(__('workbench.fields.tree.heading'))->schema([
                        TextInput::make('title', __('workbench.fields.tree.title-field'))->required(),
                    ]),
                    RowTemplate::make('product')->label(__('workbench.common.product-line'))->schema([
                        TextInput::make('product', __('workbench.common.product'))->required(),
                        TextInput::make('qty', __('workbench.common.qty'))->rules(['numeric']),
                    ]),
                    RowTemplate::make('text')->label(__('workbench.common.text'))->schema([
                        Textarea::make('content', __('workbench.common.content'))->required(),
                    ]),
                ])
                ->addLabel(__('workbench.common.add-block')),
        ]);
    }

    public function handle(): Response
    {
        return redirect('/form/fields/tree');
    }
}
