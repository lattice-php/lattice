<?php
declare(strict_types=1);

namespace Lattice\Http\Controllers;

use Illuminate\Contracts\Support\Responsable;
use Illuminate\Http\Request;
use Lattice\Core\Concerns\InteractsWithComponents;
use Lattice\Core\Contracts\SignsComponentReferences;
use Lattice\Form\FormRegistry;
use Lattice\Http\Controllers\Concerns\HandlesFormSubRequests;
use Lattice\Http\Controllers\Concerns\HandlesPrecognition;
use Symfony\Component\HttpFoundation\Response;

final readonly class FormController
{
    use HandlesFormSubRequests;
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

        if (($subRequest = $this->formSubRequest($request, $definition)) instanceof Response) {
            return $subRequest;
        }

        if ($request->isPrecognitive()) {
            return $this->validatePrecognitive($request, fn (): array => $definition->validate($request));
        }

        $definition->validate($request);

        return $definition->handle($request);
    }
}
