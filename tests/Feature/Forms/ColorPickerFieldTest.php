<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Lattice\Form\Components\ColorPicker;
use Lattice\Form\FormDefinition;

function colorPickerDefinition(): FormDefinition
{
    return testFormDefinition(fn (): array => [
        ColorPicker::make('color', 'Tag color')->rules(['required', 'hex_color']),
    ]);
}

it('accepts a valid hex color through the hex_color rule', function (): void {
    $validated = colorPickerDefinition()->validate(Request::create('/', 'POST', ['color' => '#ff5733']));

    expect($validated['color'])->toBe('#ff5733');
});

it('rejects an invalid color through the hex_color rule', function (): void {
    expect(fn (): array => colorPickerDefinition()->validate(Request::create('/', 'POST', ['color' => 'not-a-color'])))
        ->toThrow(ValidationException::class);
});
