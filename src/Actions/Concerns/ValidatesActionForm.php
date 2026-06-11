<?php

declare(strict_types=1);

namespace Lattice\Lattice\Actions\Concerns;

use Illuminate\Http\Request;
use Lattice\Lattice\Actions\Components\Action;
use Lattice\Lattice\Forms\FieldValidator;

trait ValidatesActionForm
{
    /**
     * Validate the request against this action's embedded form schema and return
     * the validated, cast input. Returns an empty array when no form is attached.
     *
     * @return array<string, mixed>
     */
    public function validate(Request $request): array
    {
        $fields = $this->definition(Action::make('action'))->form?->fields() ?? collect();

        return app(FieldValidator::class)->validate($fields, $request);
    }
}
