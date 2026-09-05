<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Lattice\Form\Components\CheckboxGroup;
use Lattice\Form\FormData;
use Lattice\Form\FormDefinition;

function checkboxGroupDefinition(bool $required = false): FormDefinition
{
    return testFormDefinition(function () use ($required): array {
        $field = CheckboxGroup::make('permissions', 'Permissions')->options([
            CheckboxGroup::option('View orders', 'order:view'),
            CheckboxGroup::option('Manage orders', 'order:manage'),
        ]);

        return [$required ? $field->required() : $field];
    });
}

it('validates the checked values as a list', function (): void {
    $validated = checkboxGroupDefinition()->validate(
        Request::create('/', 'POST', ['permissions' => ['order:view']]),
    );

    expect($validated['permissions'])->toBe(['order:view']);
});

it('treats an absent field as nothing checked', function (): void {
    $validated = checkboxGroupDefinition()->validate(Request::create('/', 'POST'));

    expect($validated['permissions'])->toBe([]);
});

it('rejects a value outside the configured options', function (): void {
    expect(fn (): FormData => checkboxGroupDefinition()->validate(
        Request::create('/', 'POST', ['permissions' => ['order:view', 'tenant:delete']]),
    ))->toThrow(ValidationException::class);
});

it('fails a required group when nothing is checked', function (): void {
    expect(fn (): FormData => checkboxGroupDefinition(required: true)->validate(
        Request::create('/', 'POST'),
    ))->toThrow(ValidationException::class);
});

it('accepts a single value posted without array brackets', function (): void {
    $validated = checkboxGroupDefinition()->validate(
        Request::create('/', 'POST', ['permissions' => 'order:manage']),
    );

    expect($validated['permissions'])->toBe(['order:manage']);
});
