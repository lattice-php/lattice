<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Components\RawBlock;

it('serializes trusted raw html', function (): void {
    $node = wire(RawBlock::make('avatar')->html('<span class="avatar">AL</span>'));

    expect($node['type'])->toBe('raw-block')
        ->and($node['key'])->toBe('avatar')
        ->and($node['props']['html'])->toBe('<span class="avatar">AL</span>');
});

it('renders a blade view into raw html', function (): void {
    view()->addNamespace('raw-block-test', __DIR__);

    $node = wire(RawBlock::make()->blade('raw-block-test::Fixtures.raw-block', ['name' => 'Ada Lovelace']));

    expect($node['props']['html'])->toContain('Ada Lovelace');
});
