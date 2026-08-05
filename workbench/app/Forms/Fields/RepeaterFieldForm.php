<?php
declare(strict_types=1);

namespace Workbench\App\Forms\Fields;

use Illuminate\Http\Request;
use Lattice\Form\Attributes\AsForm;
use Lattice\Form\Components\Form as FormComponent;
use Lattice\Form\Components\Repeater;
use Lattice\Form\Components\TextInput;
use Lattice\Form\FormDefinition;
use Lattice\Ui\Components\Tab;
use Lattice\Ui\Components\Tabs;
use Lattice\Ui\Enums\Orientation;
use Symfony\Component\HttpFoundation\Response;

#[AsForm('workbench.fields.repeater.form')]
class RepeaterFieldForm extends FormDefinition
{
    public function definition(FormComponent $form, Request $request): FormComponent
    {
        return $form
            ->precognitive(300)
            ->resetOnSuccess()
            ->schema([
                Tabs::make('repeater-variants')
                    ->queryKey('type')
                    ->orientation(Orientation::Vertical)
                    ->defaultValue('basic')
                    ->schema([
                        Tab::make('basic', __('workbench.fields.variants.basic'))->schema([
                            Repeater::make('items', __('workbench.common.line-items'))
                                ->schema([
                                    TextInput::make('name', __('workbench.common.name'))->required(),
                                    TextInput::make('qty', __('workbench.common.qty'))->rules(['numeric']),
                                ])
                                ->minItems(1)
                                ->maxItems(3)
                                ->addLabel(__('workbench.common.add-line'))
                                ->defaultItems(1),
                        ]),
                        Tab::make('nested', __('workbench.fields.repeater.nested'))->schema([
                            Repeater::make('sections', __('workbench.fields.repeater.sections'))
                                ->schema([
                                    TextInput::make('title', __('workbench.fields.repeater.section-title'))
                                        ->rules(['nullable', 'string', 'max:255']),
                                    Repeater::make('lines', __('workbench.fields.repeater.lines'))->schema([
                                        TextInput::make('note', __('workbench.fields.repeater.note'))
                                            ->rules(['nullable', 'string', 'max:255']),
                                    ]),
                                ])
                                ->addLabel(__('workbench.fields.repeater.add-section')),
                        ]),
                    ]),
            ]);
    }

    public function handle(Request $request): Response
    {
        $this->validate($request);

        return redirect('/form/fields/repeater');
    }
}
