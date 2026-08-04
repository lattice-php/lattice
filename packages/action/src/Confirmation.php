<?php
declare(strict_types=1);

namespace Lattice\Lattice\Actions;

use Lattice\Lattice\Actions\Components\Action;
use Lattice\Lattice\Attributes\TypeScript;

/**
 * The confirmation dialog an action shows before it runs. Built by {@see Action::confirm()}
 * and generated to TypeScript; an action without a confirmation serializes to
 * `null` rather than this object.
 */
#[TypeScript]
final readonly class Confirmation
{
    public function __construct(
        public ?string $title = null,
        public ?string $description = null,
        public ?string $confirmLabel = null,
        public ?string $cancelLabel = null,
    ) {}
}
