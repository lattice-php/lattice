<?php
declare(strict_types=1);

namespace Workbench\App\Forms\Fields;

use Illuminate\Http\Request;
use Lattice\Core\Attributes\AsForm;
use Lattice\Form\Components\Builder;
use Lattice\Form\Components\Form as FormComponent;
use Lattice\Form\Components\RowTemplate;
use Lattice\Form\Components\Textarea;
use Lattice\Form\Components\TextInput;
use Lattice\Form\FormDefinition;
use Lattice\Ui\Components\Tab;
use Lattice\Ui\Components\Tabs;
use Lattice\Ui\Enums\ColumnWidth;
use Lattice\Ui\Enums\Orientation;
use Symfony\Component\HttpFoundation\Response;

#[AsForm('workbench.fields.builder.form')]
class BuilderFieldForm extends FormDefinition
{
    public function definition(FormComponent $form, Request $request): FormComponent
    {
        return $form->resetOnSuccess()->schema([
            Tabs::make('builder-variants')
                ->queryKey('type')
                ->orientation(Orientation::Vertical)
                ->defaultValue('stack')
                ->schema([
                    Tab::make('stack', __('workbench.fields.builder.stack'))->schema([
                        Builder::make('items', __('workbench.common.line-items'))
                            ->templates([
                                RowTemplate::make('text')->label(__('workbench.common.text'))->schema([
                                    Textarea::make('content', __('workbench.common.content'))->required(),
                                ]),
                                RowTemplate::make('product')->label(__('workbench.common.product-line'))->schema([
                                    TextInput::make('product', __('workbench.common.product'))->required(),
                                    TextInput::make('qty', __('workbench.common.qty'))->rules(['numeric']),
                                    TextInput::make('price', __('workbench.common.price'))->rules(['numeric']),
                                ]),
                            ])
                            ->addLabel(__('workbench.common.add-block')),
                    ]),
                    Tab::make('table', __('workbench.fields.builder.table'))->schema([
                        Builder::make('rows', __('workbench.common.line-items'))
                            ->table()
                            ->resizableColumns(showIndicator: true)
                            ->templates([
                                RowTemplate::make('product')->label(__('workbench.common.product-line'))->schema([
                                    TextInput::make('product', __('workbench.common.product'))->columnWidth(ColumnWidth::Lg)->required(),
                                    TextInput::make('qty', __('workbench.common.qty'))->columnWidth(ColumnWidth::Xs)->rules(['numeric']),
                                    TextInput::make('price', __('workbench.common.price'))->columnWidth(ColumnWidth::Sm)->rules(['numeric']),
                                ]),
                                RowTemplate::make('text')->label(__('workbench.common.text'))->schema([
                                    Textarea::make('content', __('workbench.common.content'))->required(),
                                ]),
                            ])
                            ->addLabel(__('workbench.common.add-block')),
                    ]),
                ]),
        ]);
    }

    public function handle(Request $request): Response
    {
        $this->validate($request);

        return redirect('/form/fields/builder');
    }
}
