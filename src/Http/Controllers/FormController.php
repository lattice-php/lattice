<?php
declare(strict_types=1);

namespace Lattice\Lattice\Http\Controllers;

use Illuminate\Contracts\Support\Responsable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Lattice\Lattice\Core\Concerns\InteractsWithComponents;
use Lattice\Lattice\Core\Contracts\SignsComponentReferences;
use Lattice\Lattice\Forms\FormRegistry;
use Lattice\Lattice\Http\Controllers\Concerns\HandlesPrecognition;
use Symfony\Component\HttpFoundation\Response;

final readonly class FormController
{
    use HandlesPrecognition;
    use InteractsWithComponents;

    public function __construct(
        private FormRegistry $forms,
        private SignsComponentReferences $references,
    ) {}

    public function __invoke(Request $request, string $form): Response|Responsable
    {
        $this->markPrecognitive($request);

        [$request, $definition] = $this->authorizeComponent($request, $this->references, $this->forms, 'form', $form);

        if ($request->filled('_upload')) {
            return new JsonResponse($definition->signUpload($request));
        }

        if ($request->filled('_search')) {
            return new JsonResponse($definition->searchOptions($request));
        }

        if ($request->filled('_create')) {
            return new JsonResponse($definition->createOption($request));
        }

        if ($request->boolean('_resolve')) {
            return new JsonResponse($definition->resolveFields($request));
        }

        if ($request->isPrecognitive()) {
            return $this->validatePrecognitive($request, fn () => $definition->validate($request));
        }

        $definition->validate($request);

        return $definition->handle($request);
    }
}
