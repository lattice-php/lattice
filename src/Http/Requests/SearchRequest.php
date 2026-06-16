<?php
declare(strict_types=1);

namespace Lattice\Lattice\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class SearchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'query' => ['nullable', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:255'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'counts' => ['nullable', 'boolean'],
            'recent' => ['nullable', 'boolean'],
        ];
    }

    public function queryString(): string
    {
        return (string) $this->input('query', '');
    }

    public function page(): int
    {
        return (int) $this->input('page', 1);
    }

    public function perPage(): int
    {
        return (int) $this->input('per_page', 20);
    }

    public function wantsCounts(): bool
    {
        return $this->boolean('counts');
    }

    public function wantsRecent(): bool
    {
        return $this->boolean('recent');
    }

    public function category(): ?string
    {
        $category = $this->input('category');

        return is_string($category) && $category !== '' ? $category : null;
    }
}
