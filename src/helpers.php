<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Values\Translatable;

if (! function_exists('rt')) {
    function rt(string $key): Translatable
    {
        return Translatable::make($key);
    }
}
