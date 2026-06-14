<?php
declare(strict_types=1);

namespace Lattice\Lattice\Facades;

use Illuminate\Support\Facades\Facade;
use Lattice\Lattice\Actions\EffectFlasher;

/**
 * @method static void flash(\Lattice\Lattice\Actions\Effects\AbstractEffect ...$effects)
 *
 * @see EffectFlasher
 */
final class Effects extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return EffectFlasher::class;
    }
}
