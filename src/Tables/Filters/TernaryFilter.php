<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Filters;

use Closure;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Lattice\Lattice\Facades\Evaluate;
use Lattice\Lattice\Forms\Components\Select;
use Lattice\Lattice\Forms\FormData;
use Lattice\Lattice\Tables\Attributes\AsFilter;
use Lattice\Lattice\Tables\Enums\FilterControl;

/**
 * A three-state filter: true / false / all (unset). Defaults to a boolean column
 * constraint; pass {@see queries} to drive each state with a custom query (e.g.
 * null-existence checks). Custom queries receive the `Builder` by type injection.
 */
#[AsFilter(FilterControl::Ternary)]
final class TernaryFilter extends Filter
{
    public string $trueLabel;

    public string $falseLabel;

    public string $placeholder;

    private ?Closure $trueQuery = null;

    private ?Closure $falseQuery = null;

    public function __construct(string $key)
    {
        parent::__construct($key);

        $this->trueLabel = __('lattice::common.yes');
        $this->falseLabel = __('lattice::common.no');
        $this->placeholder = __('lattice::common.all');
    }

    public function trueLabel(string $label): static
    {
        $this->trueLabel = $label;

        return $this;
    }

    public function falseLabel(string $label): static
    {
        $this->falseLabel = $label;

        return $this;
    }

    public function placeholder(string $label): static
    {
        $this->placeholder = $label;

        return $this;
    }

    /**
     * @param  Closure(Builder<Model>): mixed  $true
     * @param  Closure(Builder<Model>): mixed  $false
     */
    public function queries(Closure $true, Closure $false): static
    {
        $this->trueQuery = $true;
        $this->falseQuery = $false;

        return $this;
    }

    /**
     * @return array<int, Select>
     */
    #[\Override]
    public function schema(): array
    {
        return [
            Select::make('value', $this->label)
                ->placeholder($this->placeholder)
                ->options([
                    $this->option($this->trueLabel, 'true'),
                    $this->option($this->falseLabel, 'false'),
                ])
                ->rules(['string']),
        ];
    }

    /**
     * @return string|list<string|FilterIndicator|array{label?: string, value: mixed}>|array<string, mixed>|null
     */
    #[\Override]
    public function indicator(FormData $data): string|array|null
    {
        $state = is_scalar($data->get('value'))
            ? filter_var($data->get('value'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE)
            : null;

        if ($state === null) {
            return null;
        }

        return $state ? $this->trueLabel : $this->falseLabel;
    }

    public function apply(Builder $builder, FormData $data): void
    {
        $value = $data->get('value');
        $state = is_scalar($value) ? filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) : null;

        if ($state === null) {
            return;
        }

        $query = $state ? $this->trueQuery : $this->falseQuery;

        if ($query instanceof Closure) {
            Evaluate::resolve(
                $query,
                Evaluate::context()->typed($builder::class, $builder)->typed(Request::class, request()),
            );

            return;
        }

        $builder->where($this->column(), $state);
    }

    /**
     * @return array{label: string, value: string}
     */
    private function option(string $label, string $value): array
    {
        return ['label' => $label, 'value' => $value];
    }
}
