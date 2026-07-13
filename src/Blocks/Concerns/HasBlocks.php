<?php
declare(strict_types=1);

namespace Lattice\Lattice\Blocks\Concerns;

use Lattice\Lattice\Blocks\BlockRenderer;
use Lattice\Lattice\Core\PageSchema;

trait HasBlocks
{
    public function renderBlocks(string $attribute): PageSchema
    {
        $rows = $this->{$attribute};

        return app(BlockRenderer::class)->render(is_array($rows) ? $rows : []);
    }
}
