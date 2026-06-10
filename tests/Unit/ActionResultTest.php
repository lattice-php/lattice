<?php

declare(strict_types=1);

use Lattice\Lattice\Actions\ActionResult;

it('marks a successful result as ok', function (): void {
    expect(ActionResult::success(['id' => 1])->toArray())
        ->toMatchArray(['ok' => true, 'data' => ['id' => 1]]);
});

it('marks a failed result as not ok', function (): void {
    expect(ActionResult::failure(['reason' => 'denied'])->toArray())
        ->toMatchArray(['ok' => false, 'data' => ['reason' => 'denied']]);
});
