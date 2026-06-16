<?php

declare(strict_types=1);

namespace Lattice\Lattice\Support\Testing\Assertions;

use Lattice\Lattice\Core\Enums\ButtonVariant;
use Lattice\Lattice\Support\Testing\ComponentNode;
use PHPUnit\Framework\Assert;

final readonly class ActionAssertions
{
    public function __construct(
        private ComponentNode $node,
        private ComponentAssertions $root,
    ) {}

    public function assertLabel(string $label): self
    {
        Assert::assertSame($label, $this->node->prop('label'), sprintf(
            'Expected action [%s] label to be [%s].',
            $this->node->id() ?? '*',
            $label,
        ));

        return $this;
    }

    public function assertEndpoint(string $endpoint): self
    {
        Assert::assertSame($endpoint, $this->node->prop('endpoint'), sprintf(
            'Expected action [%s] endpoint to be [%s].',
            $this->node->id() ?? '*',
            $endpoint,
        ));

        return $this;
    }

    public function assertVariant(ButtonVariant $variant): self
    {
        Assert::assertSame($variant->value, $this->node->prop('variant'), sprintf(
            'Expected action [%s] variant to be [%s].',
            $this->node->id() ?? '*',
            $variant->value,
        ));

        return $this;
    }

    public function assertHasConfirmation(): self
    {
        Assert::assertIsArray($this->node->prop('confirmation'), sprintf(
            'Expected action [%s] to have a confirmation dialog.',
            $this->node->id() ?? '*',
        ));

        return $this;
    }

    public function assertConfirmationTitle(string $title): self
    {
        $confirmation = $this->node->prop('confirmation');

        Assert::assertIsArray($confirmation, sprintf(
            'Expected action [%s] to have a confirmation dialog.',
            $this->node->id() ?? '*',
        ));
        Assert::assertSame($title, $confirmation['title'] ?? null, sprintf(
            'Expected action [%s] confirmation title to be [%s].',
            $this->node->id() ?? '*',
            $title,
        ));

        return $this;
    }

    public function assertHasForm(): self
    {
        Assert::assertIsArray($this->node->prop('form'), sprintf(
            'Expected action [%s] to have an embedded form.',
            $this->node->id() ?? '*',
        ));

        return $this;
    }

    public function end(): ComponentAssertions
    {
        return $this->root;
    }
}
