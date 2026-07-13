<?php
declare(strict_types=1);

namespace Lattice\Lattice\Actions\Contracts;

use Illuminate\Http\Request;
use Lattice\Lattice\Core\Option;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Forms\ResolveResponse;

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
     * @return array{options: list<Option>}
     */
    public function searchOptions(Request $request): array;

    public function resolveFields(Request $request): ResolveResponse;
}
