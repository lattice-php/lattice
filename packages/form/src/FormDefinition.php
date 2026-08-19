<?php
declare(strict_types=1);

namespace Lattice\Form;

use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Lattice\Core\Definition;
use Lattice\Form\Components\Field;
use Lattice\Form\Components\Form;
use Lattice\Form\Concerns\ResolvesFormFields;

/**
 * A concrete form declares a public `handle()` method with a flexible
 * signature — parameters resolve by name (`$data` for the validated
 * `FormData`, `$request` for the current `Request`), by type (`FormData`,
 * `Request`), or fall back to the container. It must return a Symfony
 * `Response` or a `Responsable`, e.g.:
 *
 *     public function handle(FormData $data): Response
 */
abstract class FormDefinition extends Definition
{
    use ResolvesFormFields;

    abstract public function definition(Form $form, Request $request): Form;

    public function validate(Request $request): FormData
    {
        return FormData::make(app(FieldValidator::class)->validate($this->formFields($request), $request));
    }

    /**
     * @return Collection<int, Field>
     */
    protected function formFields(Request $request): Collection
    {
        return $this->definition(Form::make('form'), $request)->fields();
    }
}
