<?php
declare(strict_types=1);

namespace Lattice\Tests\Fixtures\Media;

use Closure;
use Illuminate\Image\Image;
use Lattice\Media\Models\Media;

final class CustomMedia extends Media
{
    /**
     * @return array<string, Closure(Image): Image>
     */
    #[\Override]
    public function defaultConversions(): array
    {
        return ['square' => fn (Image $image): Image => $image->cover(100, 100)];
    }

    #[\Override]
    public function previewConversion(): string
    {
        return 'square';
    }
}
