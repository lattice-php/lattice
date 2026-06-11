<?php

declare(strict_types=1);

use Lattice\Lattice\Forms\Components\PasswordInput;

describe('docs fixtures', function (): void {
    it('dumps the password input examples', function (): void {
        dumpFixture('password-input.basic', [
            PasswordInput::make('password', 'Password')->placeholder('Your password'),
        ]);

        dumpFixture('password-input.confirmation', [
            PasswordInput::make('password', 'Password')->needsConfirmation(),
        ]);

        expect('docs/fixtures/password-input.basic.json')->toBeReadableFile()
            ->and('docs/fixtures/password-input.confirmation.json')->toBeReadableFile();
    });
});
