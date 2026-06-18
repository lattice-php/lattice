<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms;

use Illuminate\Contracts\Support\Responsable;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Lattice\Lattice\Core\Definition;
use Lattice\Lattice\Core\Enums\Variant;
use Lattice\Lattice\Core\Values\ToastMessage;
use Lattice\Lattice\Core\Values\Translatable;
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
     * Start a fluent form response — queue effects and a redirect.
     */
    protected function respond(): FormResponse
    {
        return FormResponse::make();
    }

    /**
     * Start a fluent form response with a toast already queued.
     */
    protected function toast(string|Translatable|ToastMessage|Variant $message, Variant|string|null $variant = null): FormResponse
    {
        return FormResponse::make()->toast($message, $variant);
    }

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
