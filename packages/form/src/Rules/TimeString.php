<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

final class TimeString implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) || ! preg_match('/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/', $value)) {
            $fail('The :attribute field must be a valid time.');
        }
    }
}
