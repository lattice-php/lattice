<?php
declare(strict_types=1);

namespace Lattice\Form;

use Illuminate\Contracts\Support\Responsable;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Lattice\Core\Definition;
use Lattice\Form\Components\Field;
use Lattice\Form\Components\Form;
use Lattice\Form\Concerns\ResolvesFormFields;
use Symfony\Component\HttpFoundation\Response;

abstract class FormDefinition extends Definition
{
    use ResolvesFormFields;

    abstract public function definition(Form $form, Request $request): Form;

    abstract public function handle(Request $request): Response|Responsable;

    /**
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
        return $this->definition(Form::make('form'), $request)->fields();
    }
}
