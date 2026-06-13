<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Contracts;

use Illuminate\Contracts\Support\Responsable;
use Illuminate\Http\Request;
use Lattice\Lattice\Forms\Components\Form;
use Symfony\Component\HttpFoundation\Response;

interface ProvidesForm
{
    public function definition(Form $form, Request $request): Form;

    public function handle(Request $request): Response|Responsable;
}
