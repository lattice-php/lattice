<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Sources;

use Closure;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Lattice\Lattice\Core\EloquentOptions;
use Lattice\Lattice\Ui\Contracts\TreeSource;
use Lattice\Lattice\Ui\Values\TreeNode;

/**
 * A {@see TreeSource} backed by an Eloquent adjacency-list hierarchy (a
 * self-referencing parent column), mirroring how {@see EloquentOptions}
 * bridges Eloquent into the option contract.
 */
final class EloquentTreeSource implements TreeSource
{
    /** @var Closure(Builder<Model>): mixed|null */
    private ?Closure $scope = null;

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

        return $this;
    }

    public function parent(string $column): self
    {
        $this->parentKey = $column;

        return $this;
    }

    /**
     * Constrain the query (e.g. only active rows). Applied to roots, children,
     * and the hasChildren existence check alike.
     *
     * @param  Closure(Builder<Model>): mixed  $scope
     */
    public function scope(Closure $scope): self
    {
        $this->scope = $scope;

        return $this;
    }

    public function roots(): iterable
    {
        return $this->toNodes($this->query()->whereNull($this->parentKey)->orderBy($this->labelKey)->get());
    }

    public function children(string $parentId): iterable
    {
        return $this->toNodes($this->query()->where($this->parentKey, $parentId)->orderBy($this->labelKey)->get());
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
     * @param  Collection<int, Model>  $models
     * @return list<TreeNode>
     */
    private function toNodes(Collection $models): array
    {
        return $models
            ->map(fn (Model $model): TreeNode => TreeNode::make(
                (string) $model->getAttribute($this->labelKey),
                (string) $model->getKey(),
            )->hasChildren($this->hasChildren($model)))
            ->values()
            ->all();
    }

    private function hasChildren(Model $model): bool
    {
        return $this->query()->where($this->parentKey, $model->getKey())->exists();
    }
}
