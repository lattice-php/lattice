<?php
declare(strict_types=1);

namespace Lattice\Form\Components;

use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Http\Request;
use Lattice\Form\Attributes\AsField;
use Lattice\Form\Components\Concerns\HasMinMax;
use Lattice\Form\Components\Concerns\HasStep;
use Lattice\Form\Enums\FieldType;
use Lattice\Form\FormData;
use Lattice\Form\Rules\DateTimeWithTimezone;
use Lattice\Ui\Concerns\HasAutoFocus;
use Lattice\Ui\Concerns\HasTabIndex;

#[AsField(FieldType::DateTimeInput)]
class DateTimeInput extends Field
{
    use HasAutoFocus;
    use HasMinMax;
    use HasStep;
    use HasTabIndex;

    public bool $convertTimezone = false;

    public ?string $timezone = null;

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
