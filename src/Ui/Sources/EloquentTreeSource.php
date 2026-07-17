<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Sources;

use Illuminate\Database\Eloquent\Model;
use Lattice\Lattice\Core\Concerns\ScopedEloquentQuery;
use Lattice\Lattice\Core\EloquentOptions;
use Lattice\Lattice\Ui\Contracts\TreeSource;
use Lattice\Lattice\Ui\Values\TreeNode;

/**
 * A {@see TreeSource} backed by an Eloquent adjacency-list hierarchy (a
 * self-referencing parent column), mirroring how {@see EloquentOptions}
 * bridges Eloquent into the option contract.
 *
 * The whole scoped table is loaded once and served from an in-memory
 * adjacency map — for an adjacency list one scan beats a query per parent,
 * and the eager Tree walk asks for every level anyway.
 */
final class EloquentTreeSource implements TreeSource
{
    use ScopedEloquentQuery;

    private const string ROOTS = '';

    /** @var array<string, list<TreeNode>>|null */
    private ?array $childrenByParent = null;

    /**
     * @param  class-string<Model>  $model
     */
    private function __construct(
        private readonly string $model,
        private string $labelKey = 'name',
        private string $parentKey = 'parent_id',
    ) {}

    /**
     * @param  class-string<Model>  $model
     */
    public static function make(string $model): self
    {
        return new self($model);
    }

    public function label(string $column): self
    {
        $this->labelKey = $column;
        $this->childrenByParent = null;

        return $this;
    }

    public function parent(string $column): self
    {
        $this->parentKey = $column;
        $this->childrenByParent = null;

        return $this;
    }

    public function roots(): iterable
    {
        return $this->childrenByParent()[self::ROOTS] ?? [];
    }

    public function children(string $parentId): iterable
    {
        return $this->childrenByParent()[$parentId] ?? [];
    }

    /**
     * @return array<string, list<TreeNode>>
     */
    private function childrenByParent(): array
    {
        if ($this->childrenByParent !== null) {
            return $this->childrenByParent;
        }

        /** @var array<string, list<Model>> $modelsByParent */
        $modelsByParent = [];

        foreach ($this->query()->orderBy($this->labelKey)->get() as $model) {
            $parent = $model->getAttribute($this->parentKey);
            $modelsByParent[$parent === null ? self::ROOTS : (string) $parent][] = $model;
        }

        $this->childrenByParent = [];

        foreach ($modelsByParent as $parent => $models) {
            $this->childrenByParent[$parent] = array_map(
                fn (Model $model): TreeNode => TreeNode::make(
                    (string) $model->getAttribute($this->labelKey),
                    (string) $model->getKey(),
                )->hasChildren(isset($modelsByParent[(string) $model->getKey()])),
                $models,
            );
        }

        return $this->childrenByParent;
    }
}
