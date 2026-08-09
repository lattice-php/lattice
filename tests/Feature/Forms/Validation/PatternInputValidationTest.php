<?php

declare(strict_types=1);

use Lattice\Form\Components\Choice;
use Lattice\Form\Components\PatternInput;
use Lattice\Form\PatternInput\PatternToken;

function patternField(): PatternInput
{
    return PatternInput::make('pattern')
        ->tokens([
            PatternToken::make('NUMBER')->configurable([
                Choice::make('padding')->options([4 => '4', 5 => '5'])->value(4),
            ]),
            PatternToken::make('YYYY'),
        ])
        ->requiredTokens(['NUMBER']);
}

it('accepts a well-formed pattern of text and token segments', function (): void {
    $errors = validationErrors(testFormDefinition(fn (): array => [patternField()]), [
        'pattern' => [
            ['type' => 'text', 'value' => 'RE-'],
            ['type' => 'token', 'token' => 'NUMBER', 'config' => ['padding' => '4']],
            ['type' => 'text', 'value' => '-'],
            ['type' => 'token', 'token' => 'YYYY'],
        ],
    ]);

    expect($errors)->toBe([]);
});

it('rejects an unknown token name', function (): void {
    $errors = validationErrors(testFormDefinition(fn (): array => [patternField()]), [
        'pattern' => [['type' => 'token', 'token' => 'MADE_UP']],
    ]);

    expect($errors)->toHaveKey('pattern');
});

it('rejects the same token used twice', function (): void {
    $errors = validationErrors(testFormDefinition(fn (): array => [patternField()]), [
        'pattern' => [
            ['type' => 'token', 'token' => 'NUMBER'],
            ['type' => 'token', 'token' => 'NUMBER'],
        ],
    ]);

    expect($errors)->toHaveKey('pattern');
});

it('rejects a pattern missing a required token', function (): void {
    $errors = validationErrors(testFormDefinition(fn (): array => [patternField()]), [
        'pattern' => [['type' => 'token', 'token' => 'YYYY']],
    ]);

    expect($errors)->toHaveKey('pattern');
});

it('validates a token config field against its own schema', function (): void {
    $errors = validationErrors(testFormDefinition(fn (): array => [patternField()]), [
        'pattern' => [['type' => 'token', 'token' => 'NUMBER', 'config' => ['padding' => '9']]],
    ]);

    expect($errors)->toHaveKey('pattern.0.config.padding');
});
