<?php

declare(strict_types=1);

namespace Lattice\Lattice\Actions\Contracts;

use Illuminate\Http\Request;
use Lattice\Lattice\Forms\Components\Form;

/**
 * An action definition that drives an embedded form: it validates the submission
 * and answers the form sub-requests (lazy schema, option search, field resolution)
 * the modal makes against the action endpoint.
 */
interface InteractsWithForm
{
    /**
     * @return array<string, mixed>
     */
    public function validate(Request $request): array;

    public function resolveFormSchema(Request $request): ?Form;

    /**
     * @return array{options: array<int, array{label: string, value: string}>}
     */
    public function searchOptions(Request $request): array;

    /**
     * @return array{fields: array<string, mixed>, values: array<string, mixed>}
     */
    public function resolveFields(Request $request): array;
}
