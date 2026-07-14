<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Lattice\Lattice\Forms\Components\ColorPicker;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Forms\FormDefinition;
use Symfony\Component\HttpFoundation\Response;

function colorPickerDefinition(): FormDefinition
{
    return new class extends FormDefinition
    {
        public function definition(Form $form, Request $request): Form
        {
            return $form->schema([
                ColorPicker::make('color', 'Tag color')->rules(['required', 'hex_color']),
            ]);
        }

        public function handle(Request $request): Response
        {
            return new Response('ok');
        }
    };
}

it('accepts a valid hex color through the hex_color rule', function (): void {
    $validated = colorPickerDefinition()->validate(Request::create('/', 'POST', ['color' => '#ff5733']));

    expect($validated['color'])->toBe('#ff5733');
});

it('rejects an invalid color through the hex_color rule', function (): void {
    expect(fn (): array => colorPickerDefinition()->validate(Request::create('/', 'POST', ['color' => 'not-a-color'])))
        ->toThrow(ValidationException::class);
});
