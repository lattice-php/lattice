<?php

declare(strict_types=1);

namespace Lattice\Lattice\Support\Testing\Assertions;

use Closure;
use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Support\Testing\ComponentNode;
use Lattice\Lattice\Ui\Components\Component;
use PHPUnit\Framework\Assert;

final readonly class ComponentAssertions
{
    public function __construct(private ComponentNode $node) {}

    /**
     * @param  (Closure(FormAssertions): mixed)|null  $tap
     */
    public function form(?string $id = null, ?Closure $tap = null): FormAssertions|self
    {
        $node = $this->node->firstOfTypeIncludingSelf('form', $id);

        Assert::assertNotNull($node, sprintf(
            'Lattice form [%s] not found. Rendered: [%s].',
            $id ?? '*',
            implode(', ', $this->node->availableSelectors()),
        ));

        $assertions = new FormAssertions($node, $this);

        if ($tap instanceof Closure) {
            $tap($assertions);

            return $this;
        }

        return $assertions;
    }

    /**
     * @param  (Closure(TableAssertions): mixed)|null  $tap
     */
    public function table(?string $id = null, ?Closure $tap = null): TableAssertions|self
    {
        $node = $this->node->firstOfTypeIncludingSelf('table', $id);

        Assert::assertNotNull($node, sprintf(
            'Lattice table [%s] not found. Rendered: [%s].',
            $id ?? '*',
            implode(', ', $this->node->availableSelectors()),
        ));

        $assertions = new TableAssertions($node, $this);

        if ($tap instanceof Closure) {
            $tap($assertions);

            return $this;
        }

        return $assertions;
    }

    /**
     * @param  (Closure(ActionAssertions): mixed)|null  $tap
     */
    public function action(string $id, ?Closure $tap = null): ActionAssertions|self
    {
        $node = $this->node->firstOfTypeIncludingSelf('action', $id);

        Assert::assertNotNull($node, sprintf(
            'Lattice action [%s] not found. Rendered: [%s].',
            $id,
            implode(', ', $this->node->availableSelectors()),
        ));

        $assertions = new ActionAssertions($node, $this);

        if ($tap instanceof Closure) {
            $tap($assertions);

            return $this;
        }

        return $assertions;
    }

    /**
     * @param  class-string<Component>|string  $type  A wire type (`'menu-item'`) or
     *                                                the component class (`MenuItem::class`).
     * @param  (Closure(self): mixed)|null  $tap
     */
    public function component(string $type, ?string $id = null, ?Closure $tap = null): self
    {
        $type = $this->resolveType($type);
        $node = $this->node->firstOfTypeIncludingSelf($type, $id);

        Assert::assertNotNull($node, sprintf(
            'Lattice component [%s] not found. Rendered: [%s].',
            $id === null ? $type : $type.':'.$id,
            implode(', ', $this->node->availableSelectors()),
        ));

        $scoped = new self($node);

        if ($tap instanceof Closure) {
            $tap($scoped);

            return $this;
        }

        return $scoped;
    }

    /**
     * Assert a prop value. The key may be dot-notated to reach into nested prop
     * data: `assertProp('state.sales_prices.0.amount', '49.99')`.
     */
    public function assertProp(string $key, mixed $value): self
    {
        Assert::assertSame($value, data_get($this->node->props(), $key), sprintf(
            'Expected prop [%s] on [%s] to equal %s.',
            $key,
            $this->node->type() ?? 'root',
            var_export($value, true),
        ));

        return $this;
    }

    /**
     * @param  array<string, mixed>  $props
     */
    public function assertProps(array $props): self
    {
        foreach ($props as $key => $value) {
            $this->assertProp($key, $value);
        }

        return $this;
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
        $type = $this->resolveType($type);

        return $this->node->findAllIncludingSelf(
            static fn (ComponentNode $node): bool => $node->matches($type, $id),
        );
    }

    private function resolveType(string $type): string
    {
        if (is_subclass_of($type, Component::class)) {
            return AsComponent::wireTypeForClass($type);
        }

        return $type;
    }
}
