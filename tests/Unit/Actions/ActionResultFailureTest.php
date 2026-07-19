<?php
declare(strict_types=1);

use Lattice\Lattice\Actions\ActionResult;

test('success results carry a 200 status and no effects', function (): void {
    $result = ActionResult::success();

    expect($result->status())->toBe(200)
        ->and($result->effects)->toBe([]);
});

test('failure without a message is a 422 with no effects', function (): void {
    $result = ActionResult::failure();

    expect($result->status())->toBe(422)
        ->and($result->effects)->toBe([]);
});

test('failure with a message attaches an error toast and stays 422', function (): void {
    $result = ActionResult::failure('Order already shipped.');

    expect($result->status())->toBe(422)
        ->and(wire($result)['effects'][0])
        ->toMatchArray([
            'type' => 'toast',
            'props' => [
                'variant' => 'error',
                'message' => 'Order already shipped.',
                'duration' => null,
                'persistent' => false,
                'dismissible' => true,
                'action' => null,
            ],
        ]);
});

test('chaining an effect preserves the failure status', function (): void {
    $result = ActionResult::failure('Nope.')->reloadComponent('app.products');

    expect($result->status())->toBe(422)
        ->and($result->effects)->toHaveCount(2);
});
