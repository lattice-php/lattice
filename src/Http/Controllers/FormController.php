<?php
declare(strict_types=1);

namespace Lattice\Lattice\Http\Controllers;

use Illuminate\Contracts\Support\Responsable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Lattice\Lattice\Core\Concerns\InteractsWithLatticeComponents;
use Lattice\Lattice\Core\Contracts\SignsComponentReferences;
use Lattice\Lattice\Forms\FormRegistry;
use Lattice\Lattice\Http\Controllers\Concerns\HandlesPrecognition;
use Symfony\Component\HttpFoundation\Response;

final class FormController
{
    use HandlesPrecognition;
    use InteractsWithLatticeComponents;

    public function __construct(
        private readonly FormRegistry $forms,
        private readonly SignsComponentReferences $references,
    ) {}

    public function __invoke(Request $request, string $form): Response|Responsable
    {
        $this->markPrecognitive($request);

        [$request, $definition] = $this->authorizeComponent($request, $this->references, $this->forms, 'form', $form);

        if ($request->filled('_search')) {
            return new JsonResponse($definition->searchOptions($request));
        }

        if ($request->boolean('_resolve')) {
            return new JsonResponse($definition->resolveFields($request));
        }

        if ($request->isPrecognitive()) {
            return $this->validatePrecognitive($request, fn () => $definition->validate($request));
        }

        return $definition->handle($request);
    }
}
