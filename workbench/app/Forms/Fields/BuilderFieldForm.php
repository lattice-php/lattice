<?php
declare(strict_types=1);

namespace Workbench\App\Forms\Fields;

use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\AsForm;
use Lattice\Lattice\Forms\Components\Builder;
use Lattice\Lattice\Forms\Components\Form as FormComponent;
use Lattice\Lattice\Forms\Components\RowTemplate;
use Lattice\Lattice\Forms\Components\Textarea;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Forms\FormDefinition;
use Lattice\Lattice\Ui\Components\Tab;
use Lattice\Lattice\Ui\Components\Tabs;
use Lattice\Lattice\Ui\Enums\ColumnWidth;
use Lattice\Lattice\Ui\Enums\Orientation;
use Symfony\Component\HttpFoundation\Response;

#[AsForm('workbench.fields.builder.form')]
class BuilderFieldForm extends FormDefinition
{
    public function definition(FormComponent $form, Request $request): FormComponent
    {
        return $form->schema([
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
