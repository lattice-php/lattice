<?php
declare(strict_types=1);

namespace Lattice\Tests\Fixtures\Media;

use Closure;
use Illuminate\Image\Image;
use Workbench\App\Models\Product;

/** Two collections sharing one name, one reusing a global default, one naming nothing. */
final class ConversionProduct extends Product
{
    protected $table = 'products';

    /**
     * @return array<array-key, string|Closure(Image): Image>
     */
    #[\Override]
    public function mediaConversions(string $collection): array
    {
        return match ($collection) {
            'gallery', 'hero' => ['card' => fn (Image $image): Image => $image->cover(120, 80)],
            'legacy' => ['thumb'],
            'typo' => ['thumbnail'],
            default => [],
        };
    }
}
