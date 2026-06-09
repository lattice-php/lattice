<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Contracts;

use Bambamboole\Lattice\Components\Form\Form;
use Illuminate\Contracts\Support\Responsable;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

interface ProvidesForm
{
    public function definition(Form $form, Request $request): Form;

    public function handle(Request $request): Response|Responsable;
}
