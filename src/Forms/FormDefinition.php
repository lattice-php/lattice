<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms;

use Illuminate\Contracts\Support\Responsable;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Lattice\Lattice\Core\Definition;
use Lattice\Lattice\Forms\Components\Field;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Forms\Concerns\ResolvesFormFields;
use Lattice\Lattice\Forms\Contracts\HandlesUploads;
use Lattice\Lattice\Forms\Contracts\ProvidesForm;
use Symfony\Component\HttpFoundation\Response;

abstract class FormDefinition extends Definition implements HandlesUploads, ProvidesForm
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
