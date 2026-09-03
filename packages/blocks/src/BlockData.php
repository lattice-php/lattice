<?php
declare(strict_types=1);

namespace Lattice\Blocks;

use Lattice\Form\FormData;

/**
 * A block's data as seen by its render: the stored values cast through the
 * block's fields, with the same typed readers a form handler gets. `editing()`
 * tells a render whether it targets the editor canvas, where an empty field
 * still needs a visible spot to type into, or a read-only output.
 */
final class BlockData extends FormData
{
    private bool $editing = false;

    /**
     * @param  array<string, mixed>  $data
     */
    public static function of(array $data, bool $editing = false): self
    {
        $instance = new self($data);
        $instance->editing = $editing;

        return $instance;
    }

    public function editing(): bool
    {
        return $this->editing;
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
