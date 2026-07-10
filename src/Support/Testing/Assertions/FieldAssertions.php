<?php

declare(strict_types=1);

namespace Lattice\Lattice\Support\Testing\Assertions;

use Lattice\Lattice\Core\Enums\Op;
use Lattice\Lattice\Forms\Conditions\Condition;
use Lattice\Lattice\Forms\FormData;
use Lattice\Lattice\Support\Testing\ComponentNode;
use PHPUnit\Framework\Assert;

final readonly class FieldAssertions
{
    public function __construct(
        private ComponentNode $node,
        private FormAssertions $form,
        private ?ComponentNode $formNode = null,
    ) {}

    /**
     * Asserts the field's shared render gate did not hide it (no truthy ->hidden()
     * or false ->visible()). It does NOT evaluate conditional visibility: a field
     * shown only by ->visibleWhen(...) still passes here because the render gate is
     * independent of the condition DSL. Use assertVisibleWhen($state) to evaluate
     * visibility for a given form state.
     *
     * A gate-hidden field never reaches the wire — the shared gate drops it from
     * the schema before serialization — so resolving this field's node already
     * proves its render gate passed (shouldRender() was true).
     */
    public function assertVisible(): self
    {
        return $this;
    }

    /**
     * A gate-hidden field never reaches the wire — the shared gate drops it from
     * the schema before serialization — so it cannot be resolved to a node and
     * handed to this assertion in the first place. Use
     * FormAssertions::assertMissingField($name) to assert that instead.
     */
    public function assertHidden(): self
    {
        Assert::fail(sprintf(
            'Field [%s] is present, so its render gate did not hide it. A gate-hidden field is dropped from the schema entirely — use assertMissingField(\'%s\') to assert that.',
            $this->name(),
            $this->name(),
        ));
    }

    /**
     * Evaluates this field's own `visible` conditions against the given form
     * state. It does not account for an ancestor (section/tab) being hidden — a
     * field visible by its own rule reports visible even inside a hidden section.
     *
     * @param  array<string, mixed>  $state
     */
    public function assertVisibleWhen(array $state): self
    {
        Assert::assertTrue($this->evaluate('visible', $state), sprintf(
            'Expected field [%s] to be visible when %s.',
            $this->name(),
            json_encode($state),
        ));

        return $this;
    }

    /**
     * @param  array<string, mixed>  $state
     */
    public function assertHiddenWhen(array $state): self
    {
        Assert::assertFalse($this->evaluate('visible', $state), sprintf(
            'Expected field [%s] to be hidden when %s.',
            $this->name(),
            json_encode($state),
        ));

        return $this;
    }

    public function assertRequired(): self
    {
        Assert::assertSame(true, $this->node->prop('required'), sprintf(
            'Expected field [%s] to be required.',
            $this->name(),
        ));

        return $this;
    }

    public function assertOptional(): self
    {
        Assert::assertNotSame(true, $this->node->prop('required'), sprintf(
            'Expected field [%s] to be optional.',
            $this->name(),
        ));

        return $this;
    }

    public function assertDisabled(): self
    {
        Assert::assertSame(true, $this->node->prop('disabled'), sprintf(
            'Expected field [%s] to be disabled.',
            $this->name(),
        ));

        return $this;
    }

    public function assertEnabled(): self
    {
        Assert::assertNotSame(true, $this->node->prop('disabled'), sprintf(
            'Expected field [%s] to be enabled.',
            $this->name(),
        ));

        return $this;
    }

    public function assertReadOnly(): self
    {
        Assert::assertSame(true, $this->node->prop('readOnly'), sprintf(
            'Expected field [%s] to be read-only.',
            $this->name(),
        ));

        return $this;
    }

    /**
     * Asserts the value the field is seeded with. A ->fill()ed form's state for
     * this field wins; otherwise the field's own ->value() is used — matching the
     * bound-edit runtime precedence.
     */
    public function assertInitialValue(mixed $expected): self
    {
        Assert::assertSame($expected, $this->initialValue(), sprintf(
            'Expected field [%s] initial value to match.',
            $this->name(),
        ));

        return $this;
    }

    public function assertHasCondition(string $type, string $field, Op $operator, mixed $value): self
    {
        $expected = ['field' => $field, 'operator' => $operator->value, 'value' => $value];

        Assert::assertContainsEquals($expected, $this->conditionClauses($type), sprintf(
            'Expected field [%s] to have a [%s] condition on [%s].',
            $this->name(),
            $type,
            $field,
        ));

        return $this;
    }

    public function end(): FormAssertions
    {
        return $this->form;
    }

    private function name(): string
    {
        $name = $this->node->prop('name');

        return is_string($name) ? $name : '?';
    }

    private function initialValue(): mixed
    {
        $name = $this->node->prop('name');

        if ($this->formNode instanceof ComponentNode && is_string($name)) {
            $state = $this->formNode->prop('state');

            if (is_array($state) && array_key_exists($name, $state)) {
                return $state[$name];
            }
        }

        return $this->node->prop('value');
    }

    /**
     * @param  array<string, mixed>  $state
     */
    private function evaluate(string $type, array $state): bool
    {
        if ($this->node->prop('hidden') === true) {
            return false;
        }

        $data = FormData::make($state);

        foreach ($this->conditionClauses($type) as $clause) {
            $condition = new Condition($clause['field'], Op::from($clause['operator']), $clause['value']);

            if (! $condition->matches($data)) {
                return false;
            }
        }

        return true;
    }

    /**
     * @return array<int, array{field: string, operator: string, value: mixed}>
     */
    private function conditionClauses(string $type): array
    {
        $conditions = $this->node->prop('conditions');

        if (! is_array($conditions)) {
            return [];
        }

        $clauses = $conditions[$type] ?? [];

        return is_array($clauses) ? $clauses : [];
    }
}
