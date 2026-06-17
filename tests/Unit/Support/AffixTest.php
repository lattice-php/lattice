<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Enums\Icon;
use Lattice\Lattice\Support\Affix;

it('builds an icon affix from a backed enum', function (): void {
    expect(wire(Affix::icon(Icon::Eye)))->toBe(['icon' => 'eye', 'text' => null]);
});

it('builds an icon affix from a raw string name', function (): void {
    expect(wire(Affix::icon('custom-glyph')))->toBe(['icon' => 'custom-glyph', 'text' => null]);
});

it('builds a text affix', function (): void {
    expect(wire(Affix::text('kg')))->toBe(['icon' => null, 'text' => 'kg']);
});

it('resolves a backed enum to an icon affix', function (): void {
    expect(wire(Affix::from(Icon::Eye)))->toBe(['icon' => 'eye', 'text' => null]);
});

it('resolves a plain string to a text affix', function (): void {
    expect(wire(Affix::from('USD')))->toBe(['icon' => null, 'text' => 'USD']);
});

it('passes an existing affix through unchanged', function (): void {
    $affix = Affix::icon(Icon::Eye);

    expect(Affix::from($affix))->toBe($affix);
});
