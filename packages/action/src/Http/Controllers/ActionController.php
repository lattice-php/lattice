<?php
declare(strict_types=1);

namespace Lattice\Actions\Http\Controllers;

use Illuminate\Http\Request;
use Lattice\Actions\ActionRegistry;
use Lattice\Actions\ActionResult;
use Lattice\Core\Concerns\InteractsWithComponents;
use Lattice\Core\Contracts\SignsComponentReferences;
use Lattice\Form\FormData;
use Lattice\Form\Http\Controllers\Concerns\HandlesFormSubRequests;
use Lattice\Form\Http\Controllers\Concerns\HandlesPrecognition;
use Lattice\Form\Http\Controllers\Concerns\InvokesHandleMethod;
use LogicException;
use Symfony\Component\HttpFoundation\Response;

final readonly class ActionController
{
    use HandlesFormSubRequests;
    use HandlesPrecognition;
    use InteractsWithComponents;
    use InvokesHandleMethod;

    public function __construct(
        private ActionRegistry $actions,
        private SignsComponentReferences $references,
    ) {}

    public function __invoke(Request $request, string $action): Response
    {
        $this->markPrecognitive($request);

        [$request, $definition] = $this->authorizeComponent($request, $this->references, $this->actions, 'action', $action);

        if (($response = $this->formSubRequest($request, $definition)) instanceof Response) {
            return $response;
        }

        if ($request->isPrecognitive()) {
            return $this->validatePrecognitive($request, fn (): FormData => $definition->validate($request));
        }

        $result = $this->invokeHandle($definition, $request, $definition->validate($request));

        if (! $result instanceof ActionResult) {
            throw new LogicException(sprintf('%s::handle() must return an %s.', $definition::class, ActionResult::class));
        }

        return response()->json($result, $result->status());
    }
}
