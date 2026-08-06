<?php
declare(strict_types=1);

namespace Lattice\Tests\Fixtures\Media;

use Closure;
use Illuminate\Image\Image;
use Lattice\Media\Models\Media;

/** One sound conversion followed by one that forgets `Image` is immutable. */
final class PartialConversionMedia extends Media
{
    /**
     * @return array<string, Closure(Image): Image>
     */
    #[\Override]
    public function defaultConversions(): array
    {
        /** @phpstan-ignore return.type */
        return [
            'ok' => fn (Image $image): Image => $image->cover(50, 50),
            'broken' => fn (Image $image): mixed => null,
        ];
    }
}
