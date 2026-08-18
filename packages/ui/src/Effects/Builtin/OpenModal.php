<?php
declare(strict_types=1);

namespace Lattice\Ui\Effects\Builtin;

use InvalidArgumentException;
use Lattice\Ui\Components\Modal;
use Lattice\Ui\Effects\Attributes\AsEffect;
use Lattice\Ui\Effects\Effect;

#[AsEffect('open-modal')]
final class OpenModal extends Effect
{
    public function __construct(
        public readonly Modal $node,
    ) {
        if ($this->node->componentId() === null) {
            throw new InvalidArgumentException('The modal passed to OpenModal must be given an id() — use Modal::make($id) instead of the bare constructor.');
        }
    }
}
