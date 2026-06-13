<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Lattice\Lattice\Forms\Components\Field;
use Lattice\Lattice\Forms\FieldValidator;
use Lattice\Lattice\Forms\FormData;

it('merges a field nestedRules into the validator and validates them', function (): void {
    $field = new class extends Field
    {
        public function nestedRules(FormData $data, Request $request): array
        {
            return ['items.*.name' => ['required', 'string']];
        }
    };
    $field->name = 'items';

    $request = Request::create('/', 'POST', ['items' => [['name' => '']]]);

    (new FieldValidator)->validate([$field], $request);
})->throws(ValidationException::class);

it('passes when nested rules are satisfied', function (): void {
    $field = new class extends Field
    {
        public function nestedRules(FormData $data, Request $request): array
        {
            return ['items.*.name' => ['required', 'string']];
        }
    };
    $field->name = 'items';

    $request = Request::create('/', 'POST', ['items' => [['name' => 'ok']]]);

    $validated = (new FieldValidator)->validate([$field], $request);

    expect($validated['items'])->toBe([['name' => 'ok']]);
});
