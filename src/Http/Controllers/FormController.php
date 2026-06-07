<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Http\Controllers;

use Bambamboole\Lattice\Forms\FormRegistry;
use Illuminate\Contracts\Support\Responsable;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class FormController
{
    public function __construct(private readonly FormRegistry $forms) {}

    public function __invoke(Request $request, string $form): Response|Responsable
    {
        return $this->forms->resolve($form)->handle($request);
    }
}
