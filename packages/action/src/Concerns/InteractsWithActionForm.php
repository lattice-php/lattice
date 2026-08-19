<?php
declare(strict_types=1);

namespace Lattice\Actions\Concerns;

use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Lattice\Actions\Components\Action;
use Lattice\Form\Components\Field;
use Lattice\Form\Components\Form;
use Lattice\Form\Concerns\ResolvesFormFields;
use Lattice\Form\FieldValidator;
use Lattice\Form\FormData;

/**
 * Validation, searchable options, and computed-field resolution for an action's
 * embedded form. The fields come from the action's serialized Form component, so
 * actions reuse the same machinery forms use without depending on a registered form.
 */
trait InteractsWithActionForm
{
    use ResolvesFormFields;

    /**
     * Validate the request against this action's embedded form schema and return
     * the validated, cast input. Empty when no form is attached.
     */
    public function validate(Request $request): FormData
    {
        return FormData::make(app(FieldValidator::class)->validate($this->formFields($request), $request));
    }

    /**
     * The form rendered for this action's modal. Static by default (the schema
     * declared via Action::form); FormActionDefinition overrides this to build a
     * request-aware, prefilled schema on demand.
     */
    public function resolveFormSchema(Request $request): ?Form
    {
        return $this->definition(Action::make('action'))->form;
    }

    /**
     * @return Collection<int, Field>
     */
    protected function formFields(Request $request): Collection
    {
        return $this->resolveFormSchema($request)?->fields() ?? collect();
    }
}
