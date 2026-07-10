<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Components;

use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Http\Request;
use Lattice\Lattice\Forms\Attributes\AsField;
use Lattice\Lattice\Forms\Enums\FieldType;
use Lattice\Lattice\Forms\FormData;
use Lattice\Lattice\Forms\Rules\DateTimeWithTimezone;
use Lattice\Lattice\Ui\Concerns\HasAutoFocus;
use Lattice\Lattice\Ui\Concerns\HasTabIndex;

#[AsField(FieldType::DateTimeInput)]
class DateTimeInput extends Field
{
    use HasAutoFocus;
    use HasTabIndex;

    public ?string $min = null;

    public ?string $max = null;

    public ?int $step = null;

    public bool $convertTimezone = false;

    public ?string $timezone = null;

    public function min(string $min): static
    {
        $this->min = $min;

        return $this;
    }

    public function max(string $max): static
    {
        $this->max = $max;

        return $this;
    }

    public function step(int $step): static
    {
        $this->step = $step;

        return $this;
    }

    public function convertTimeZone(?string $timezone = null): static
    {
        $this->convertTimezone = true;
        $this->timezone = $timezone;

        return $this;
    }

    /**
     * @return array<int, mixed>
     */
    #[\Override]
    protected function defaultRules(): array
    {
        return [new DateTimeWithTimezone];
    }

    #[\Override]
    public function castValue(mixed $value): mixed
    {
        if (! is_string($value) || $value === '') {
            return $value;
        }

        $date = CarbonImmutable::createFromFormat(DateTimeWithTimezone::Format, $value);

        if (! $date instanceof CarbonImmutable || ! $this->convertTimezone) {
            return $date;
        }

        return $date->setTimezone($this->timezone ?? (string) config('app.timezone', 'UTC'));
    }

    #[\Override]
    public function hydrateState(mixed $value, ?FormData $form = null, ?Request $request = null): void
    {
        if ($value instanceof CarbonInterface) {
            $this->value($value->format(DateTimeWithTimezone::Format));
        }
    }
}
