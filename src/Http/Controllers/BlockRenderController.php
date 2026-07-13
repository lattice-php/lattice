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
        $attributes = is_array($request->input('attributes')) ? $request->input('attributes') : [];

        foreach ([$type, ...$this->slotTypes($attributes)] as $rowType) {
            abort_unless(in_array($rowType, $allowed, true), 403);
        }

        try {
            $this->blocks->resolve($type);
        } catch (UnknownComponent) {
            abort(404);
        }

        $wire = $this->renderer->render([['type' => $type, ...$attributes]])->renderable();

        return response()->json(['wire' => $wire]);
    }

    /**
     * Every block type nested in the row's slots, at any depth.
     *
     * @param  array<string, mixed>  $attributes
     * @return array<int, mixed>
     */
    private function slotTypes(array $attributes): array
    {
        $slots = is_array($attributes['slots'] ?? null) ? $attributes['slots'] : [];
        $types = [];

        foreach ($slots as $rows) {
            foreach (is_array($rows) ? $rows : [] as $row) {
                if (! is_array($row)) {
                    continue;
                }

                $types[] = $row['type'] ?? null;
                $types = [...$types, ...$this->slotTypes($row)];
            }
        }

        return $types;
    }
}
