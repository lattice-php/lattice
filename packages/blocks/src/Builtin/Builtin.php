<?php
declare(strict_types=1);

namespace Lattice\Blocks\Builtin;

use Lattice\Blocks\BlockDefinition;

final class Builtin
{
    /**
     * @return list<class-string<BlockDefinition>>
     */
    public static function all(): array
    {
        return [
            ParagraphBlock::class,
            HeadingBlock::class,
            ListBlock::class,
            QuoteBlock::class,
            ImageBlock::class,
            GalleryBlock::class,
            SeparatorBlock::class,
            SpacerBlock::class,
            SectionBlock::class,
            ColumnsBlock::class,
        ];
    }
}
