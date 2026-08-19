<?php
declare(strict_types=1);

namespace Lattice\Form\Http\Controllers;

use Illuminate\Contracts\Support\Responsable;
use Illuminate\Http\Request;
use Lattice\Core\Concerns\InteractsWithComponents;
use Lattice\Core\Contracts\SignsComponentReferences;
use Lattice\Form\FormData;
use Lattice\Form\FormRegistry;
use Lattice\Form\Http\Controllers\Concerns\HandlesFormSubRequests;
use Lattice\Form\Http\Controllers\Concerns\HandlesPrecognition;
use Lattice\Form\Http\Controllers\Concerns\InvokesHandleMethod;
use LogicException;
use Symfony\Component\HttpFoundation\Response;

final readonly class FormController
{
    use HandlesFormSubRequests;
    use HandlesPrecognition;
    use InteractsWithComponents;
    use InvokesHandleMethod;

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
            return $this->validatePrecognitive($request, fn (): FormData => $definition->validate($request));
        }

        $response = $this->invokeHandle($definition, $request, $definition->validate($request));

        if (! $response instanceof Response && ! $response instanceof Responsable) {
            throw new LogicException(sprintf(
                '%s::handle() must return a %s or %s.',
                $definition::class,
                Response::class,
                Responsable::class,
            ));
        }

        return $response;
    }
}
