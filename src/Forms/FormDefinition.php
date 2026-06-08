<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Forms;

use Bambamboole\Lattice\Components\Form\Form;
use Illuminate\Contracts\Support\Responsable;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

abstract class FormDefinition
{
    abstract public function definition(Form $form): Form;

    abstract public function handle(Request $request): Response|Responsable;
}
