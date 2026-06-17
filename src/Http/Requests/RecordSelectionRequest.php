<?php
declare(strict_types=1);

namespace Lattice\Lattice\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class RecordSelectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'category' => ['required', 'string', 'max:255'],
            'id' => ['required', 'string', 'max:255'],
        ];
    }
}
