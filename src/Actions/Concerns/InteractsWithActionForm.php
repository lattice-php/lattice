<?php

declare(strict_types=1);

namespace Lattice\Lattice\Actions\Concerns;

use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Lattice\Lattice\Actions\Components\Action;
use Lattice\Lattice\Forms\Components\Field;
use Lattice\Lattice\Forms\Concerns\ResolvesFormFields;
use Lattice\Lattice\Forms\FieldValidator;

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
     * the validated, cast input. Returns an empty array when no form is attached.
     *
     * @return array<string, mixed>
     */
    public function validate(Request $request): array
    {
        return app(FieldValidator::class)->validate($this->formFields($request), $request);
    }

    /**
     * @return Collection<int, Field>
     */
    protected function formFields(Request $request): Collection
    {
        return $this->definition(Action::make('action'))->form?->fields() ?? collect();
    }
}
