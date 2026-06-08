<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Forms;

use Bambamboole\Lattice\Components\Form\Form;
use Bambamboole\Lattice\Concerns\CreatesToastMessages;
use Bambamboole\Lattice\Definition;
use Illuminate\Contracts\Support\Responsable;
use Illuminate\Contracts\Validation\Factory as ValidationFactory;
use Illuminate\Http\Request;
use Illuminate\Validation\Validator;
use Symfony\Component\HttpFoundation\Response;

abstract class FormDefinition extends Definition
{
    use CreatesToastMessages;

    abstract public function definition(Form $form, Request $request): Form;

    abstract public function handle(Request $request): Response|Responsable;

    /**
     * @return array<string, mixed>
     */
    public function rules(Request $request): array
    {
        return [];
    }

    /**
     * @return array<string, string>
     */
    public function messages(Request $request): array
    {
        return [];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(Request $request): array
    {
        return [];
    }

    /**
     * @return array<string, mixed>
     */
    public function validate(Request $request): array
    {
        return $this->validator($request)->validate();
    }

    protected function validator(Request $request): Validator
    {
        $validator = app(ValidationFactory::class)->make(
            $request->all(),
            $this->rules($request),
            $this->messages($request),
            $this->attributes($request),
        );

        if ($request->isPrecognitive()) {
            $validator->setRules(
                $request->filterPrecognitiveRules($validator->getRulesWithoutPlaceholders()),
            );
        }

        return $validator;
    }
}
