<?php

declare(strict_types=1);

namespace Lattice\Lattice\Support\Testing\Assertions;

use Closure;
use Lattice\Lattice\Support\Testing\ComponentNode;
use PHPUnit\Framework\Assert;

final readonly class ComponentAssertions
{
    public function __construct(private ComponentNode $node) {}

    public function form(?string $id = null, ?Closure $tap = null): FormAssertions|self
    {
        $node = $this->node->firstOfTypeIncludingSelf('form', $id);

        Assert::assertNotNull($node, sprintf(
            'Lattice form [%s] not found. Rendered: [%s].',
            $id ?? '*',
            implode(', ', $this->node->availableSelectors()),
        ));

        $assertions = new FormAssertions($node, $this);

        if ($tap !== null) {
            $tap($assertions);

            return $this;
        }

        return $assertions;
    }

    public function table(?string $id = null, ?Closure $tap = null): TableAssertions|self
    {
        $node = $this->node->firstOfTypeIncludingSelf('table', $id);

        Assert::assertNotNull($node, sprintf(
            'Lattice table [%s] not found. Rendered: [%s].',
            $id ?? '*',
            implode(', ', $this->node->availableSelectors()),
        ));

        $assertions = new TableAssertions($node, $this);

        if ($tap !== null) {
            $tap($assertions);

            return $this;
        }

        return $assertions;
    }

    public function action(string $id, ?Closure $tap = null): ActionAssertions|self
    {
        $node = $this->node->firstOfTypeIncludingSelf('action', $id);

        Assert::assertNotNull($node, sprintf(
            'Lattice action [%s] not found. Rendered: [%s].',
            $id,
            implode(', ', $this->node->availableSelectors()),
        ));

        $assertions = new ActionAssertions($node, $this);

        if ($tap !== null) {
            $tap($assertions);

            return $this;
        }

        return $assertions;
    }

    public function assertRendered(string $selector): self
    {
        Assert::assertNotEmpty($this->select($selector), sprintf(
            'Expected [%s] to be rendered. Rendered: [%s].',
            $selector,
            implode(', ', $this->node->availableSelectors()),
        ));

        return $this;
    }

    public function assertNotRendered(string $selector): self
    {
        Assert::assertEmpty($this->select($selector), sprintf(
            'Expected [%s] to NOT be rendered, but it was.',
            $selector,
        ));

        return $this;
    }

    public function assertRenderedCount(string $type, int $count): self
    {
        Assert::assertCount($count, $this->select($type));

        return $this;
    }

    public function assertHasForm(?string $id = null): self
    {
        return $this->assertRendered($id === null ? 'form' : 'form:'.$id);
    }

    public function assertHasTable(?string $id = null): self
    {
        return $this->assertRendered($id === null ? 'table' : 'table:'.$id);
    }

    /**
     * @return array<int, ComponentNode>
     */
    private function select(string $selector): array
    {
        [$type, $id] = array_pad(explode(':', $selector, 2), 2, null);

        return $this->node->findAllIncludingSelf(
            static fn (ComponentNode $node): bool => $node->type() === $type
                && ($id === null || $node->id() === $id),
        );
    }
}
