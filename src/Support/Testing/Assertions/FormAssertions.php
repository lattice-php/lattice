<?php

declare(strict_types=1);

namespace Lattice\Lattice\Support\Testing\Assertions;

use Closure;
use Lattice\Lattice\Support\Testing\ComponentNode;
use PHPUnit\Framework\Assert;

final readonly class FormAssertions
{
    public function __construct(
        private ComponentNode $node,
        private ComponentAssertions $root,
    ) {}

    /**
     * @param  (Closure(FieldAssertions): mixed)|null  $tap
     */
    public function field(string $name, ?Closure $tap = null): FieldAssertions|self
    {
        $node = $this->node->field($name);

        Assert::assertNotNull($node, sprintf(
            'Lattice form field [%s] not found at [%s]. Available fields: [%s].',
            $name,
            $this->node->path(),
            implode(', ', $this->node->availableFieldNames()),
        ));

        $assertions = new FieldAssertions($node, $this, $this->node);

        if ($tap instanceof Closure) {
            $tap($assertions);

            return $this;
        }

        return $assertions;
    }

    public function assertHasField(string $name): self
    {
        Assert::assertNotNull($this->node->field($name), sprintf(
            'Expected form [%s] to have field [%s]. Available fields: [%s].',
            $this->node->id() ?? '*',
            $name,
            implode(', ', $this->node->availableFieldNames()),
        ));

        return $this;
    }

    public function assertMissingField(string $name): self
    {
        Assert::assertNull($this->node->field($name), sprintf(
            'Expected form [%s] to NOT have field [%s], but it does.',
            $this->node->id() ?? '*',
            $name,
        ));

        return $this;
    }

    public function assertSubmitsTo(string $endpoint): self
    {
        Assert::assertSame($endpoint, $this->node->prop('action'));

        return $this;
    }

    public function end(): ComponentAssertions
    {
        return $this->root;
    }
}
