<?php
declare(strict_types=1);

namespace Lattice\Lattice\Facades;

use Illuminate\Support\Facades\Facade;
use Lattice\Lattice\Effects\EffectFlasher;

/**
 * @method static void flash(\Lattice\Lattice\Effects\Contracts\Effect ...$effects)
 * @method static \Lattice\Lattice\Http\LatticeResponse respond()
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
