<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Components;

use Lattice\Lattice\Attributes\TypeScript;

/**
 * A link rendered next to a field's label (for example a "Forgot password?"
 * link beside a password field). Fields without one serialize to `null`.
 */
#[TypeScript]
final readonly class LabelAction
{
    public function __construct(
        public string $href,
        public string $label,
        public ?int $tabIndex = null,
    ) {}
}
