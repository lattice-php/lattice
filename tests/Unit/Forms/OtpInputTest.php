<?php
declare(strict_types=1);

use Lattice\Lattice\Forms\Components\OtpInput;

test('otp input serializes its wire type and default length', function (): void {
    $wire = wire(OtpInput::make('code', 'Code'));

    expect($wire['type'])->toBe('field.otp');
    expect($wire['props']['length'])->toBe(6);
});

test('otp input length is configurable', function (): void {
    expect(wire(OtpInput::make('code', 'Code')->length(4))['props']['length'])->toBe(4);
});
