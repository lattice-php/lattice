<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Http\Controllers;

use Bambamboole\Lattice\Forms\FormRegistry;
use Bambamboole\Lattice\Security\ComponentReferenceSigner;
use Illuminate\Contracts\Support\Responsable;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class FormController
{
    public function __construct(
        private readonly FormRegistry $forms,
        private readonly ComponentReferenceSigner $references,
    ) {}

    public function __invoke(Request $request, string $form): Response|Responsable
    {
        $request = $this->references->mergeTrustedContext($request, 'form', $form);
        $definition = $this->forms->resolve($form);

        abort_unless($definition->authorize($request), 403);

        return $definition->handle($request);
    }
}
