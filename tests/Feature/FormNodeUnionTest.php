<?php

declare(strict_types=1);

use Lattice\Lattice\Forms\Components\Checkbox;
use Lattice\Lattice\Forms\Components\Choice;
use Lattice\Lattice\Forms\Components\DateInput;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Forms\Components\HiddenInput;
use Lattice\Lattice\Forms\Components\NumberInput;
use Lattice\Lattice\Forms\Components\PasswordInput;
use Lattice\Lattice\Forms\Components\RichEditor;
use Lattice\Lattice\Forms\Components\Select;
use Lattice\Lattice\Forms\Components\SubmitButton;
use Lattice\Lattice\Forms\Components\Textarea;
use Lattice\Lattice\Forms\Components\TextInput;

function wireType(string $class): string
{
    $reflection = new ReflectionClass($class);
    $instance = $reflection->newInstanceWithoutConstructor();
    $method = $reflection->getMethod('type');
    $method->setAccessible(true);

    return $method->invoke($instance);
}

it('keeps every form component wire type present in the generated FormNode union', function (string $class): void {
    $types = file_get_contents(dirname(__DIR__, 2).'/resources/js/generated/types.ts');

    [$union] = explode('export type FormNodeType', $types, 2);
    [, $formNodeBlock] = explode('export type FormFieldNode', $union, 2);

    expect($formNodeBlock)->toContain('"'.wireType($class).'"');
})->with([
    TextInput::class,
    Textarea::class,
    Select::class,
    Choice::class,
    Checkbox::class,
    DateInput::class,
    NumberInput::class,
    PasswordInput::class,
    HiddenInput::class,
    RichEditor::class,
    SubmitButton::class,
    Form::class,
]);
