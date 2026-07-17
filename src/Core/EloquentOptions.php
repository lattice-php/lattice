<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core;

use Closure;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Lattice\Lattice\Core\Concerns\ScopedEloquentQuery;
use Lattice\Lattice\Core\Contracts\OptionSource;

/**
 * An {@see OptionSource} backed by an Eloquent model — the opt-in bridge that
 * keeps Eloquent out of the Select itself, mirroring how `EloquentTableSource`
 * backs a table without coupling the core table classes.
 */
final class EloquentOptions implements OptionSource
{
    use ScopedEloquentQuery;

    /** @var list<string>|null */
    private ?array $searchColumns = null;

    private int $limit = 50;

    /** @var list<string>|Closure(Model): array<string, mixed>|null */
    private array|Closure|null $data = null;

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
     * @param  Collection<int, Model>  $models
     * @return list<Option>
     */
    private function toOptions(Collection $models): array
    {
        return $models
            ->map(fn (Model $model): Option => new Option(
                (string) $model->getAttribute($this->labelKey),
                (string) $model->getAttribute($this->valueColumn()),
                $this->optionData($model),
            ))
            ->values()
            ->all();
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
