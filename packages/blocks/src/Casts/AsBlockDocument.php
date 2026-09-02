<?php
declare(strict_types=1);

namespace Lattice\Blocks\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;
use Lattice\Blocks\BlockDocument;
use Lattice\Core\Support\Wire;

/**
 * @implements CastsAttributes<BlockDocument|null, BlockDocument|array<string, mixed>|string|null>
 */
final class AsBlockDocument implements CastsAttributes
{
    /**
     * @param  array<string, mixed>  $attributes
     */
    public function get(Model $model, string $key, mixed $value, array $attributes): ?BlockDocument
    {
        if ($value === null || $value === '') {
            return null;
        }

        return BlockDocument::fromArray(is_string($value) ? $value : (is_array($value) ? $value : null));
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function set(Model $model, string $key, mixed $value, array $attributes): ?string
    {
        if ($value === null) {
            return null;
        }

        if (! $value instanceof BlockDocument) {
            $value = BlockDocument::fromArray($value);
        }

        return json_encode(Wire::toArray($value), JSON_THROW_ON_ERROR);
    }
}
