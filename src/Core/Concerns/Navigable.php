<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Concerns;

use InvalidArgumentException;

/**
 * The shared navigation surface for components that link somewhere: a label, an
 * optional href, and the HTTP method the href is followed with.
 */
trait Navigable
{
    use HasHttpMethod;

    public string $label = '';

    public ?string $href = null;

    public function href(string $href): static
    {
        if (($this->action ?? null) !== null) {
            throw new InvalidArgumentException('A navigation item bound to an action cannot also have an href; an action and an href are mutually exclusive.');
        }

        $this->href = $href;

        return $this;
    }

    public function label(string $label): static
    {
        $this->label = $label;

        return $this;
    }
}
