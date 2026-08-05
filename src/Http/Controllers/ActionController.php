<?php
declare(strict_types=1);

namespace Lattice\Http\Controllers;

use Illuminate\Http\Request;
use Lattice\Actions\ActionRegistry;
use Lattice\Core\Concerns\InteractsWithComponents;
use Lattice\Core\Contracts\SignsComponentReferences;
use Lattice\Form\Http\Controllers\Concerns\HandlesFormSubRequests;
use Lattice\Form\Http\Controllers\Concerns\HandlesPrecognition;
use Symfony\Component\HttpFoundation\Response;

final readonly class ActionController
{
    use HandlesFormSubRequests;
    use HandlesPrecognition;
    use InteractsWithComponents;

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
            return $this->validatePrecognitive($request, fn (): array => $definition->validate($request));
        }

        $definition->validate($request);

        $result = $definition->handle($request);

        return response()->json($result, $result->status());
    }
}
