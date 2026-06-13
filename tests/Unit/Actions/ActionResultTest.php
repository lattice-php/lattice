<?php
declare(strict_types=1);

use Lattice\Lattice\Actions\ActionResult;

it('marks a successful result as ok', function (): void {
    expect(wire(ActionResult::success(['id' => 1])))
        ->toMatchArray(['ok' => true, 'data' => ['id' => 1]]);
});

it('marks a failed result as not ok', function (): void {
    expect(wire(ActionResult::failure(['reason' => 'denied'])))
        ->toMatchArray(['ok' => false, 'data' => ['reason' => 'denied']]);
});
