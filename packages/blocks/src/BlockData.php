<?php
declare(strict_types=1);

namespace Lattice\Blocks;

use Lattice\Form\FormData;

/**
 * A block's data as seen by its render: the stored values cast through the
 * block's fields, with the same typed readers a form handler gets.
 */
final class BlockData extends FormData
{
    /**
     * @param  array<string, mixed>  $data
     */
    public static function of(array $data): self
    {
        return new self($data);
    }

    /**
     * @return array<string, mixed>|null
     */
    public function document(string $key): ?array
    {
        $value = $this->get($key);

        return is_array($value) && $value !== [] ? $value : null;
    }
}
