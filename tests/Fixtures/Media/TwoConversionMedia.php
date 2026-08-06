<?php
declare(strict_types=1);

namespace Lattice\Tests\Fixtures\Media;

use Closure;
use Illuminate\Image\Image;
use Lattice\Media\Models\Media;

/** Two default conversions, so `--only` has something to leave alone. */
final class TwoConversionMedia extends Media
{
    /**
     * @return array<string, Closure(Image): Image>
     */
    #[\Override]
    public function defaultConversions(): array
    {
        return [
            'thumb' => fn (Image $image): Image => $image->cover(400, 400)->optimize('webp', 70),
            'square' => fn (Image $image): Image => $image->cover(100, 100),
        ];
    }
}
