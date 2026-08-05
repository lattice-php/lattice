<?php
declare(strict_types=1);

namespace Lattice\Ui\Effects\Builtin;

use Lattice\Ui\Effects\Attributes\AsEffect;
use Lattice\Ui\Effects\Effect;

#[AsEffect('open-modal')]
final class OpenModal extends Effect
{
    public function __construct(
        public readonly string $modal,
    ) {}
}
