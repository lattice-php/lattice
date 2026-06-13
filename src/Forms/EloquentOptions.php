<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms;

use Closure;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Lattice\Lattice\Core\Option;
use Lattice\Lattice\Forms\Contracts\OptionSource;

/**
 * An {@see OptionSource} backed by an Eloquent model — the opt-in bridge that
 * keeps Eloquent out of the Select itself, mirroring how `EloquentTableSource`
 * backs a table without coupling the core table classes.
 */
final class EloquentOptions implements OptionSource
{
    /** @var list<string>|null */
    private ?array $searchColumns = null;

    /** @var Closure(Builder<Model>): mixed|null */
    private ?Closure $scope = null;

    private int $limit = 50;

    private ?string $resolvedValueKey = null;

    /**
     * @param  class-string<Model>  $model
     */
    private function __construct(
        private readonly string $model,
        private string $labelKey = 'name',
        private ?string $valueKey = null,
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

    public function value(string $column): self
    {
        $this->valueKey = $column;
        $this->resolvedValueKey = null;

        return $this;
    }

    /**
     * Columns matched against the query; defaults to the label column.
     *
     * @param  list<string>  $columns
     */
    public function searchColumns(array $columns): self
    {
        $this->searchColumns = $columns;

        return $this;
    }

    /**
     * Constrain the query (e.g. only active rows). Applied to both search and selected.
     *
     * @param  Closure(Builder<Model>): mixed  $scope
     */
    public function scope(Closure $scope): self
    {
        $this->scope = $scope;

        return $this;
    }

    public function limit(int $limit): self
    {
        $this->limit = $limit;

        return $this;
    }

    public function search(string $query): array
    {
        $builder = $this->query();

        if ($query !== '') {
            $columns = $this->searchColumns ?? [$this->labelKey];
            $builder->where(function (Builder $nested) use ($columns, $query): void {
                foreach ($columns as $column) {
                    $nested->orWhere($column, 'like', '%'.$query.'%');
                }
            });
        }

        return $this->toOptions($builder->orderBy($this->labelKey)->limit($this->limit)->get());
    }

    public function selected(array $values): array
    {
        if ($values === []) {
            return [];
        }

        return $this->toOptions($this->query()->whereIn($this->valueColumn(), $values)->get());
    }

    /**
     * The value column, defaulting to the model's primary key when not set explicitly.
     */
    private function valueColumn(): string
    {
        return $this->resolvedValueKey ??= $this->valueKey ?? (new $this->model)->getKeyName();
    }

    /**
     * @return Builder<Model>
     */
    private function query(): Builder
    {
        $builder = $this->model::query();

        if ($this->scope !== null) {
            $scoped = ($this->scope)($builder);

            if ($scoped instanceof Builder) {
                $builder = $scoped;
            }
        }

        return $builder;
    }

    /**
     * @param  Collection<int, Model>  $models
     * @return list<Option>
     */
    private function toOptions(Collection $models): array
    {
        return $models
            ->map(fn (Model $model): Option => new Option(
                (string) $model->getAttribute($this->labelKey),
                (string) $model->getAttribute($this->valueColumn()),
            ))
            ->values()
            ->all();
    }
}
