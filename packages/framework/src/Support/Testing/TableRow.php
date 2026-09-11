<?php

declare(strict_types=1);

namespace Lattice\Support\Testing;

/**
 * One row of a table endpoint response: its projected values plus the
 * components the table decorated it with — row actions and the row click.
 */
final readonly class TableRow
{
    /**
     * @param  array<array-key, mixed>  $data
     */
    public function __construct(private array $data) {}

    /**
     * @return array<array-key, mixed>
     */
    public function toArray(): array
    {
        return $this->data;
    }

    public function value(string $key): mixed
    {
        return data_get($this->data, $key);
    }

    /**
     * The row's actions as the children of one root node, so menus and groups
     * are searched like any other component tree.
     */
    public function actions(): ComponentNode
    {
        $actions = $this->data['actions'] ?? [];

        return ComponentNode::root(is_array($actions) ? array_values(array_filter($actions, is_array(...))) : [], 'row actions');
    }

    /**
     * The id (or key) of every action and link among the row's actions, with
     * menus and groups flattened, in render order.
     *
     * @return list<string>
     */
    public function actionIds(): array
    {
        $ids = [];

        foreach ($this->actions()->descendants() as $node) {
            $id = $node->id() ?? $node->key();

            if ($id !== null && in_array($node->type(), ['action', 'link'], true)) {
                $ids[] = $id;
            }
        }

        return $ids;
    }

    public function clickHref(): ?string
    {
        $href = data_get($this->data, 'rowClick.props.href');

        return is_string($href) ? $href : null;
    }
}
