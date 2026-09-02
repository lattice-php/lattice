<?php
declare(strict_types=1);

namespace Lattice\Blocks\Http;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Lattice\Blocks\BlockDocument;
use Lattice\Blocks\BlockEditorDefinition;
use Lattice\Blocks\BlockEditorRegistry;
use Lattice\Blocks\BlockNode;
use Lattice\Blocks\BlockRenderer;
use Lattice\Blocks\BlockValidator;
use Lattice\Blocks\Exceptions\StaleRevision;
use Lattice\Core\Concerns\InteractsWithComponents;
use Lattice\Core\Contracts\SignsComponentReferences;
use Symfony\Component\HttpFoundation\Response;

/**
 * One endpoint per editor: PATCH stores the draft, POST either re-renders a
 * single block (`_op=render`) or publishes the document (`_op=publish`).
 */
final readonly class BlockEditorController
{
    use InteractsWithComponents;

    public function __construct(
        private BlockEditorRegistry $editors,
        private SignsComponentReferences $references,
        private BlockRenderer $renderer,
        private BlockValidator $validator,
    ) {}

    public function __invoke(Request $request, string $editor): JsonResponse
    {
        [$request, $definition] = $this->authorizeComponent($request, $this->references, $this->editors, 'blocks.editor', $editor);

        if ($request->isMethod('PATCH')) {
            return $this->draft($request, $definition);
        }

        return match ($request->string('_op')->toString()) {
            'render' => $this->render($request, $definition),
            'publish' => $this->publish($request, $definition),
            default => abort(Response::HTTP_NOT_FOUND),
        };
    }

    private function render(Request $request, BlockEditorDefinition $definition): JsonResponse
    {
        $block = $request->input('block');

        abort_unless(is_array($block), Response::HTTP_UNPROCESSABLE_ENTITY);

        $node = BlockNode::fromArray($block);

        abort_unless(in_array($node->type, $this->editors->allowedTypes($definition), true), Response::HTTP_UNPROCESSABLE_ENTITY);

        return response()->json([
            'node' => $this->renderer->renderShallow($node),
            'errors' => $this->validator->validateBlock($node),
        ]);
    }

    private function draft(Request $request, BlockEditorDefinition $definition): JsonResponse
    {
        [$document, $revision] = $this->documentFrom($request);
        $errors = $this->validator->validate($document, $this->editors->allowedTypes($definition));

        try {
            $next = $definition->saveDraft($document, $revision);
        } catch (StaleRevision $stale) {
            return $this->stale($stale);
        }

        return response()->json(['revision' => $next, 'errors' => $errors === [] ? new \stdClass : $errors]);
    }

    private function publish(Request $request, BlockEditorDefinition $definition): JsonResponse
    {
        [$document, $revision] = $this->documentFrom($request);
        $errors = $this->validator->validate($document, $this->editors->allowedTypes($definition), strict: true);

        if ($errors !== []) {
            return response()->json(['errors' => $errors], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            $next = $definition->publish($document, $definition->saveDraft($document, $revision));
        } catch (StaleRevision $stale) {
            return $this->stale($stale);
        }

        return response()->json(['revision' => $next]);
    }

    /**
     * @return array{0: BlockDocument, 1: int}
     */
    private function documentFrom(Request $request): array
    {
        $document = $request->input('document');

        abort_unless(is_array($document), Response::HTTP_UNPROCESSABLE_ENTITY);

        return [BlockDocument::fromArray($document), $request->integer('revision')];
    }

    private function stale(StaleRevision $stale): JsonResponse
    {
        return response()->json([
            'revision' => $stale->current,
            'message' => __('blocks::blocks.errors.stale-revision'),
        ], Response::HTTP_CONFLICT);
    }
}
