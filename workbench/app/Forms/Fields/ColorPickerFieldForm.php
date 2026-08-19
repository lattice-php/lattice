<?php
declare(strict_types=1);

namespace Workbench\App\Forms\Fields;

use Illuminate\Http\Request;
use Lattice\Form\Attributes\AsForm;
use Lattice\Form\Components\ColorPicker;
use Lattice\Form\Components\Form as FormComponent;
use Lattice\Form\FormDefinition;
use Symfony\Component\HttpFoundation\Response;

#[AsForm('workbench.fields.color-picker.form')]
class ColorPickerFieldForm extends FormDefinition
{
    public function definition(FormComponent $form, Request $request): FormComponent
    {
        return $form->schema([
            ColorPicker::make('color', __('workbench.fields.color-picker.color'))
                ->placeholder(__('workbench.fields.color-picker.placeholder'))
                ->rules(['nullable', 'hex_color']),
            ColorPicker::make('brand_color', __('workbench.fields.color-picker.brand-color'))
                ->palette(['#0ea5e9', '#6366f1', '#f43f5e'])
                ->rules(['nullable', 'hex_color']),
        ]);
    }

    public function handle(): Response
    {
        return redirect('/form/fields/color-picker');
    }
}
