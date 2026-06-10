<?php

declare(strict_types=1);

use Lattice\Lattice\Forms\FormData;

it('reads typed values with defaults', function (): void {
    $data = FormData::make([
        'name' => 'Desk Lamp',
        'price' => '49.99',
        'qty' => '3',
        'active' => 'on',
    ]);

    expect($data->get('name'))->toBe('Desk Lamp')
        ->and($data->string('name'))->toBe('Desk Lamp')
        ->and($data->float('price'))->toBe(49.99)
        ->and($data->integer('qty'))->toBe(3)
        ->and($data->boolean('active'))->toBeTrue()
        ->and($data->boolean('missing'))->toBeFalse()
        ->and($data->get('missing', 'fallback'))->toBe('fallback')
        ->and($data->has('name'))->toBeTrue()
        ->and($data->has('missing'))->toBeFalse();
});
