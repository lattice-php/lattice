<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Http\Controllers;

use Bambamboole\Lattice\Core\Concerns\InteractsWithLatticeComponents;
use Bambamboole\Lattice\Core\Contracts\SignsComponentReferences;
use Bambamboole\Lattice\Forms\FormDefinition;
use Bambamboole\Lattice\Forms\FormRegistry;
use Illuminate\Contracts\Support\Responsable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;

final class FormController
{
    use InteractsWithLatticeComponents;

    public function __construct(
        private readonly FormRegistry $forms,
        private readonly SignsComponentReferences $references,
    ) {}

    public function __invoke(Request $request, string $form): Response|Responsable
    {
        if ($request->isAttemptingPrecognition()) {
            $request->attributes->set('precognitive', true);
        }

        [$request, $definition] = $this->authorizeComponent($request, $this->references, $this->forms, 'form', $form);

        if ($request->filled('_search')) {
            return new JsonResponse($definition->searchOptions($request));
        }

        if ($request->boolean('_resolve')) {
            return new JsonResponse($definition->resolveFields($request));
        }

        if ($request->isPrecognitive()) {
            return $this->validatePrecognitive($request, $definition);
        }

        return $definition->handle($request);
    }

    private function validatePrecognitive(Request $request, FormDefinition $definition): Response
    {
        try {
            $definition->validate($request);
        } catch (ValidationException $exception) {
            return $this->precognitiveResponse(new JsonResponse([
                'message' => $exception->getMessage(),
                'errors' => $exception->errors(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY));
        }

        return $this->precognitiveResponse(new Response('', Response::HTTP_NO_CONTENT, [
            'Precognition-Success' => 'true',
        ]));
    }

    private function precognitiveResponse(Response $response): Response
    {
        $response->headers->set('Precognition', 'true');
        $response->headers->set('Vary', trim(implode(', ', array_filter([
            $response->headers->get('Vary'),
            'Precognition',
        ]))));

        return $response;
    }
}
