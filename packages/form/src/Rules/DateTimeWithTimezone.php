<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Rules;

use Carbon\CarbonImmutable;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Throwable;

final class DateTimeWithTimezone implements ValidationRule
{
    public const string Format = 'Y-m-d\TH:i:s e';

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value)) {
            $fail('The :attribute field must be a valid datetime.');

            return;
        }

        try {
            $date = CarbonImmutable::createFromFormat(self::Format, $value);
        } catch (Throwable) {
            $date = false;
        }

        if (! $date instanceof CarbonImmutable || $date->format(self::Format) !== $value) {
            $fail('The :attribute field must be a valid datetime.');
        }
    }
}
