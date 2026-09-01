<?php

declare(strict_types=1);

use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Lattice\Core\Support\Wire;
use Lattice\Form\Components\Choice;
use Lattice\Form\Components\PatternInput;
use Lattice\Form\FieldValidator;
use Lattice\Form\PatternInput\PatternToken;

function documentNumberPattern(): PatternInput
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

it('casts a submitted pattern into text and token segments', function (): void {
    $request = Request::create('/', 'POST', ['pattern' => [
        ['type' => 'text', 'value' => 'RE-'],
        ['type' => 'token', 'token' => 'NUMBER', 'config' => ['padding' => '5']],
        ['type' => 'text', 'value' => '-'],
        ['type' => 'token', 'token' => 'YYYY'],
    ]]);

    $validated = (new FieldValidator)->validate([documentNumberPattern()], $request);

    expect($validated['pattern'])->toBe([
        ['type' => 'text', 'value' => 'RE-'],
        ['type' => 'token', 'token' => 'NUMBER', 'config' => ['padding' => '5']],
        ['type' => 'text', 'value' => '-'],
        ['type' => 'token', 'token' => 'YYYY', 'config' => []],
    ]);
});

it('casts a submitted pattern encoded as the client\'s JSON wire string', function (): void {
    // Real submissions arrive as JSON.stringify(segments) (pattern-input/field.tsx), not a native array.
    $request = Request::create('/', 'POST', ['pattern' => json_encode([
        ['type' => 'text', 'value' => 'RE-'],
        ['type' => 'token', 'token' => 'NUMBER', 'config' => ['padding' => '5']],
        ['type' => 'text', 'value' => '-'],
        ['type' => 'token', 'token' => 'YYYY'],
    ])]);

    $validated = (new FieldValidator)->validate([documentNumberPattern()], $request);

    expect($validated['pattern'])->toBe([
        ['type' => 'text', 'value' => 'RE-'],
        ['type' => 'token', 'token' => 'NUMBER', 'config' => ['padding' => '5']],
        ['type' => 'text', 'value' => '-'],
        ['type' => 'token', 'token' => 'YYYY', 'config' => []],
    ]);
});

it('rejects a pattern value that is neither an array nor a JSON-encoded array string', function (): void {
    $request = Request::create('/', 'POST', ['pattern' => 'not-json']);

    expect(fn (): array => (new FieldValidator)->validate([documentNumberPattern()], $request))
        ->toThrow(ValidationException::class);
});

it('keeps leading and trailing whitespace of text segments submitted as the JSON wire string', function (): void {
    // The client submits JSON.stringify(segments) precisely so TrimStrings
    // cannot strip whitespace (or multiline \n boundaries) from leaf values.
    $request = Request::create('/', 'POST', ['pattern' => json_encode([
        ['type' => 'token', 'token' => 'NUMBER', 'config' => ['padding' => '4']],
        ['type' => 'text', 'value' => ' - '],
        ['type' => 'token', 'token' => 'YYYY'],
    ])]);

    $validated = (new FieldValidator)->validate([documentNumberPattern()], $request);

    expect($validated['pattern'][1])->toBe(['type' => 'text', 'value' => ' - ']);
});

it('casts a multiline pattern through with its line breaks intact', function (): void {
    $request = Request::create('/', 'POST', ['pattern' => [
        ['type' => 'text', 'value' => "Muster GmbH\nMusterweg 1"],
        ['type' => 'token', 'token' => 'NUMBER', 'config' => ['padding' => '4']],
    ]]);

    $validated = (new FieldValidator)->validate([documentNumberPattern()->multiline()], $request);

    expect($validated['pattern'])->toBe([
        ['type' => 'text', 'value' => "Muster GmbH\nMusterweg 1"],
        ['type' => 'token', 'token' => 'NUMBER', 'config' => ['padding' => '4']],
    ]);
});

it('drops a segment for a token no longer declared on the field', function (): void {
    $field = documentNumberPattern();

    expect($field->castValue([
        ['type' => 'token', 'token' => 'REMOVED_TOKEN'],
        ['type' => 'text', 'value' => 'kept'],
    ]))->toBe([
        ['type' => 'text', 'value' => 'kept'],
    ]);
});

describe('docs fixtures', function (): void {
    it('matches the pattern input example fixture', function (): void {
        assertFixtureMatches('pattern-input.basic', Wire::toWire([
            PatternInput::make('pattern', 'Number pattern')
                ->tokens([
                    PatternToken::make('NUMBER')
                        ->label('Sequential number')
                        ->configurable([
                            Choice::make('padding', 'Padding')->options([4 => '4', 5 => '5', 6 => '6'])->value(4),
                        ]),
                    PatternToken::make('YYYY')->label('Year (4-digit)'),
                    PatternToken::make('MM')->label('Month'),
                ])
                ->requiredTokens(['NUMBER']),
        ]));
    });
});
