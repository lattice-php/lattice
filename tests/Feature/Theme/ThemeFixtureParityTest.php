<?php
declare(strict_types=1);

use Lattice\Lattice\Support\Theme\Theme;

it('matches the golden theme fixtures byte-for-byte', function (array $input, string $expected): void {
    expect(Theme::fromArray($input)->toCss())->toBe($expected);
})->with(function (): Generator {
    $fixtures = json_decode(
        file_get_contents(__DIR__.'/../../../resources/theme-fixtures.json'),
        true,
        flags: JSON_THROW_ON_ERROR,
    );

    foreach ($fixtures as $fixture) {
        yield $fixture['name'] => [$fixture['input'], $fixture['css']];
    }
});
