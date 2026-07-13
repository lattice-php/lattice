<?php
declare(strict_types=1);

namespace Workbench\App\Forms;

use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\AsForm;
use Lattice\Lattice\Forms\Components\Form as FormComponent;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Forms\FormDefinition;
use Symfony\Component\HttpFoundation\Response;

#[AsForm('workbench.validation.form')]
class ValidationDemoForm extends FormDefinition
{
    public function definition(FormComponent $form, Request $request): FormComponent
    {
        return $form
            ->precognitive(300)
            ->schema([
                TextInput::make('contact_email', __('workbench.common.email'))
                    ->email()
                    ->rules(['required', 'email']),
                TextInput::make('nickname', __('workbench.forms.validation.nickname'))
                    ->rules(['nullable', 'string', 'min:3']),
            ]);
    }

    public function handle(Request $request): Response
    {
        $this->validate($request);

        return redirect('/form/validation');
    }
}
