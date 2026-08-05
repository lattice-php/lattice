<?php
declare(strict_types=1);

namespace Lattice\Actions;

use Illuminate\Http\Request;
use Lattice\Form\Components\Form;

/**
 * An action whose form is built per request and rendered lazily in a modal. The
 * schema is fetched on open (so it can be prefilled from the trusted record
 * context) rather than inlined into the page. Submit still returns ActionResult
 * effects — reuse a FormDefinition's schema via formSchema() when convenient:
 *
 *     public function formSchema(Form $form, Request $request): Form
 *     {
 *         return app(MyForm::class)->definition($form, $request);
 *     }
 */
abstract class FormActionDefinition extends ActionDefinition
{
    abstract public function formSchema(Form $form, Request $request): Form;

    #[\Override]
    public function resolveFormSchema(Request $request): ?Form
    {
        return $this->formSchema(Form::make('form'), $request);
    }
}
