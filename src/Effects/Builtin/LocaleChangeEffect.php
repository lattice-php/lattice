<?php
declare(strict_types=1);

namespace Lattice\Lattice\Effects\Builtin;

use Lattice\Lattice\Effects\Attributes\AsEffect;
use Lattice\Lattice\Effects\Effect;

#[AsEffect('locale-change')]
final class LocaleChangeEffect extends Effect
{
    public function __construct(
        public readonly string $locale,
    ) {}
}
