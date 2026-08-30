<?php
declare(strict_types=1);

namespace Lattice;

use Closure;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Lattice\Core\Contracts\OptionSource;
use Lattice\Core\Option;

/**
 * An {@see OptionSource} backed by an Eloquent model — the opt-in bridge that
 * keeps Eloquent out of the Select itself, mirroring how `EloquentTableSource`
 * backs a table without coupling the core table classes.
 */
final class EloquentOptions implements OptionSource
{
    /** @var Closure(Builder<Model>): mixed|null */
    private ?Closure $scope = null;

    /** @var list<string>|null */
    private ?array $searchColumns = null;

    private int $limit = 50;

    /** @var list<string>|Closure(Model): array<string, mixed>|null */
    private array|Closure|null $data = null;

    private ?string $resolvedValueKey = null;

    private bool $valueExplicit = false;

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

    /**
     * Constrain every query this source issues (e.g. only active rows).
     *
     * @param  Closure(Builder<Model>): mixed  $scope
     */
    public function scope(Closure $scope): self
    {
        $this->scope = $scope;

        return $this;
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
        $this->valueExplicit = true;

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

    public function limit(int $limit): self
    {
        $this->limit = $limit;

        return $this;
    }

    /**
     * Attach a per-option data record for the select's option schema: the
     * columns to include, or a closure receiving the model for computed values.
     *
     * @param  list<string>|Closure(Model): array<string, mixed>  $data
     */
    public function data(array|Closure $data): self
    {
        $this->data = $data;

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

        if ($this->scope instanceof Closure) {
            $scoped = ($this->scope)($builder);

            if ($scoped instanceof Builder) {
                $builder = $scoped;
            }
        }

        if ($this->shouldNarrow()) {
            $builder->select(array_values(array_unique([$this->labelKey, $this->valueColumn()])))->distinct();
        }

        return $builder;
    }

    /**
     * Narrow the select to just the label/value columns and dedupe with
     * `distinct()` when the value column was explicitly chosen: mapping every
     * row to an Option would otherwise yield one option per row instead of
     * per distinct value (e.g. a `->value('assignee')` filter over a tasks
     * table). Left at today's full-row behavior when the value falls back to
     * the model key (every row's key is already unique) or a `data()`
     * accessor needs the full row.
     */
    private function shouldNarrow(): bool
    {
        return $this->valueExplicit && $this->data === null;
    }

    /**
     * @param  Collection<int, Model>  $models
     * @return list<Option>
     */
    private function toOptions(Collection $models): array
    {
        return array_values($models
            ->map(fn (Model $model): Option => new Option(
                (string) $model->getAttribute($this->labelKey),
                (string) $model->getAttribute($this->valueColumn()),
                $this->optionData($model),
            ))
            ->all());
    }

    /**
     * @return array<string, mixed>|null
     */
    private function optionData(Model $model): ?array
    {
        if ($this->data === null) {
            return null;
        }

        if ($this->data instanceof Closure) {
            return ($this->data)($model);
        }

        return $model->only($this->data);
    }
}
