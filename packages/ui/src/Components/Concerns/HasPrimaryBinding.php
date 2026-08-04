<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Components\Concerns;

/**
 * Gives a data-bindable component a `bound()` shorthand: the component declares
 * its primary wire prop once, and `Text::bound('email')` replaces the
 * `Text::make('')->dataKey('text', 'email')` idiom in bound schemas.
 */
trait HasPrimaryBinding
{
    abstract protected static function primaryBindableProp(): string;

    public static function bound(string $dataKey, ?string $key = null): static
    {
        return new static($key)->dataKey(static::primaryBindableProp(), $dataKey);
    }
}
