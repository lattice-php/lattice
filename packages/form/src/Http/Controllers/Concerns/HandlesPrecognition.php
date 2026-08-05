<?php
declare(strict_types=1);

namespace Lattice\Form\Http\Controllers\Concerns;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;

trait HandlesPrecognition
{
    protected function markPrecognitive(Request $request): void
    {
        if ($request->isAttemptingPrecognition()) {
            $request->attributes->set('precognitive', true);
        }
    }

    protected function validatePrecognitive(Request $request, Closure $validate): Response
    {
        try {
            $validate();
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
