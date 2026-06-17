<?php
declare(strict_types=1);

use Lattice\Lattice\Effects\Attributes\AsEffect;

it('returns the wire type declared by the attribute', function (): void {
    expect(new AsEffect('toast')->wireType())->toBe('toast');
});
