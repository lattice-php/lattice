<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Forms;

use Bambamboole\Lattice\Components\Form\Form;
use Bambamboole\Lattice\Concerns\CreatesToastMessages;
use Illuminate\Contracts\Support\Responsable;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

abstract class FormDefinition
{
    use CreatesToastMessages;

    abstract public function definition(Form $form, Request $request): Form;

    abstract public function handle(Request $request): Response|Responsable;

    public function authorize(Request $request): bool
    {
        return true;
    }

    protected function context(Request $request, string $key, mixed $default = null): mixed
    {
        return data_get($request->input('context', []), $key, $default);
    }
}
