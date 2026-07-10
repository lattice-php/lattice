<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Components\Link;
use Lattice\Lattice\Layouts\Components\Outlet;
use Lattice\Lattice\Tables\Filters\TernaryFilter;

it('encodes an empty node props map as a JSON object', function (): void {
    expect(wireJson(Outlet::make()))->toContain('"props":{}');
});

it('encodes an empty list field as a JSON array, not an object', function (): void {
    expect(wireJson(Link::make('Register')->href('/register')))->toContain('"effects":[]');
});

it('encodes a non-empty filter props map as a JSON object unaffected by the empty-map wrapping', function (): void {
    $json = wireJson(TernaryFilter::make('active'));

    expect($json)->toContain('"trueLabel":"Yes"')
        ->and($json)->not->toContain('"props":{}');
});
