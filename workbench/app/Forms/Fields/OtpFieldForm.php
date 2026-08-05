<?php
declare(strict_types=1);

namespace Workbench\App\Forms\Fields;

use Illuminate\Http\Request;
use Lattice\Core\Attributes\AsForm;
use Lattice\Form\Components\Form as FormComponent;
use Lattice\Form\Components\OtpInput;
use Lattice\Form\FormDefinition;
use Symfony\Component\HttpFoundation\Response;

#[AsForm('workbench.fields.otp.form')]
class OtpFieldForm extends FormDefinition
{
    public function definition(FormComponent $form, Request $request): FormComponent
    {
        return $form->schema([
            OtpInput::make('code', __('workbench.fields.otp.code'))
                ->length(6)
                ->rules(['nullable', 'string', 'size:6']),
        ]);
    }

    public function handle(Request $request): Response
    {
        $this->validate($request);

        return redirect('/form/fields/otp');
    }
}
