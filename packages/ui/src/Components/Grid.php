<?php
declare(strict_types=1);

namespace Lattice\Ui\Components;

use InvalidArgumentException;
use Lattice\Core\Attributes\AsComponent;
use Lattice\Core\Attributes\WireMap;
use Lattice\Core\Enums\Breakpoint;

#[AsComponent('grid')]
class Grid extends ContainerComponent
{
    /**
     * Breakpoint => column count or grid-template-columns track list.
     *
     * @var array<string, int|string>|null
     */
    #[WireMap]
    public ?array $columns = null;

    public static function make(?string $key = null): static
    {
        return new static($key);
    }

    /**
     * A bare value applies from the `md` breakpoint up (one column below);
     * a map sets each breakpoint explicitly. Integer values are equal-width
     * column counts, strings are raw `grid-template-columns` track lists.
     *
     * @param  int|string|array<string, int|string>  $columns
     */
    public function columns(int|string|array $columns): static
    {
        if (! is_array($columns)) {
            $columns = ['md' => $columns];
        }

        foreach ($columns as $breakpoint => $value) {
            Breakpoint::validateKey($breakpoint);

            if ((is_int($value) && $value < 1) || (is_string($value) && trim($value) === '')) {
                throw new InvalidArgumentException(sprintf(
                    'Grid columns for "%s" must be a positive integer or a grid-template-columns track list.',
                    $breakpoint,
                ));
            }
        }

        $this->columns = $columns;

        return $this;
    }
}
