<?php
declare(strict_types=1);

namespace Lattice\Tree;

use Closure;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/**
 * A {@see TreeSource} backed by an Eloquent adjacency-list hierarchy (a
 * self-referencing parent column).
 *
 * The whole scoped table is loaded once and served from an in-memory
 * adjacency map — for an adjacency list one scan beats a query per parent,
 * and the eager Tree walk asks for every level anyway.
 */
final class EloquentTreeSource implements TreeSource
{
    private const string ROOTS = '';

    /** @var Closure(Builder<Model>): mixed|null */
    private ?Closure $scope = null;

    private bool $lazy = false;

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

    /**
     * Constrain every query this source issues (e.g. only active rows).
     *
     * @param  Closure(Builder<Model>): mixed  $scope
     */
    public function scope(Closure $scope): self
    {
        $this->scope = $scope;
        $this->childrenByParent = null;

        return $this;
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

    /**
     * Query one level per call instead of loading the whole scoped table.
     * The right mode for the lazy endpoint, where each request asks for a
     * single parent's children; the full scan stays optimal for the eager
     * walk, which visits every level anyway.
     */
    public function lazy(bool $lazy = true): self
    {
        $this->lazy = $lazy;

        return $this;
    }

    public function roots(): iterable
    {
        return $this->lazy
            ? $this->level(null)
            : $this->childrenByParent()[self::ROOTS] ?? [];
    }

    public function children(string $parentId): iterable
    {
        return $this->lazy
            ? $this->level($parentId)
            : $this->childrenByParent()[$parentId] ?? [];
    }

    /**
     * One level plus a scoped EXISTS probe per row for hasChildren — no
     * relation on the consumer's model is required.
     *
     * @return list<TreeNode>
     */
    private function level(?string $parentId): array
    {
        $query = $this->query();
        $model = $query->getModel();
        $table = $model->getTable();
        $alias = "{$table}_lattice_children";

        if ($parentId === null) {
            $query->whereNull("{$table}.{$this->parentKey}");
        } else {
            $query->where("{$table}.{$this->parentKey}", $parentId);
        }

        $probe = $this->query()
            ->from("{$table} as {$alias}")
            ->selectRaw('1')
            ->whereColumn("{$alias}.{$this->parentKey}", $model->getQualifiedKeyName())
            ->limit(1);

        $rows = $query
            ->select("{$table}.*")
            ->addSelect(['lattice_tree_has_children' => $probe])
            ->orderBy($this->labelKey)
            ->get();

        return array_values($rows->map(
            fn (Model $row): TreeNode => TreeNode::make(
                (string) $row->getKey(),
                (string) $row->getAttribute($this->labelKey),
            )->hasChildren((bool) $row->getAttribute('lattice_tree_has_children')),
        )->all());
    }

    /**
     * @return Builder<Model>
     */
    private function query(): Builder
    {
        $builder = $this->model::query();

        if ($this->scope instanceof Closure) {
            $scoped = ($this->scope)($builder);

            if ($scoped instanceof Builder) {
                $builder = $scoped;
            }
        }

        return $builder;
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
                    (string) $model->getKey(),
                    (string) $model->getAttribute($this->labelKey),
                )->hasChildren(isset($modelsByParent[(string) $model->getKey()])),
                $models,
            );
        }

        return $this->childrenByParent;
    }
}
