<?php
declare(strict_types=1);

use Lattice\Lattice\I18n\Values\Translatable;

if (! function_exists('rt')) {
    function rt(string $key): Translatable
    {
        return Translatable::make($key);
    }
}
