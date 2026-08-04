<?php
declare(strict_types=1);

namespace Lattice\Media\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\Gate;
use Lattice\Media\Models\Media;

final class AttachableMedia implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $id = filter_var($value, FILTER_VALIDATE_INT);
        $media = $id === false ? null : Media::modelQuery()->find($id);

        if (! $media instanceof Media || Gate::denies('attach', $media)) {
            $fail(__('media::media.validation.not-attachable'));
        }
    }
}
