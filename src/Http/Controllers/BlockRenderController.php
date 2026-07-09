<?php
declare(strict_types=1);

namespace Lattice\Lattice\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Lattice\Lattice\Blocks\BlockRegistry;
use Lattice\Lattice\Blocks\BlockRenderer;
use Lattice\Lattice\Core\Contracts\SignsComponentReferences;
use Lattice\Lattice\Core\Exceptions\UnknownComponent;

final readonly class BlockRenderController
{
    public function __construct(
        private BlockRegistry $blocks,
        private BlockRenderer $renderer,
        private SignsComponentReferences $references,
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        $context = $this->references->trustedContext($request, 'field.block-editor', 'block-editor');

        $type = (string) $request->input('type');
        $allowed = is_array($context['allowedBlocks'] ?? null) ? $context['allowedBlocks'] : [];
        abort_unless(in_array($type, $allowed, true), 403);

        try {
            $this->blocks->resolve($type);
        } catch (UnknownComponent) {
            abort(404);
        }

        $attributes = is_array($request->input('attributes')) ? $request->input('attributes') : [];
        $wire = $this->renderer->render([['type' => $type, ...$attributes]])->renderable();

        return response()->json(['wire' => $wire]);
    }
}
