<?php
declare(strict_types=1);

use Lattice\Ui\Components\Link;
use Lattice\Ui\Components\Popover;
use Lattice\Ui\Components\Text;
use Lattice\Ui\Enums\PopoverAlign;
use Lattice\Ui\Enums\PopoverSide;

it('serializes its trigger, content, and default positioning', function (): void {
    $node = wire(
        Popover::make('user-card')
            ->trigger([Link::make('Details')])
            ->schema([Text::make('Body')]),
    );

    expect($node['type'])->toBe('popover')
        ->and($node['props'])->toMatchArray([
            'side' => 'bottom',
            'align' => 'start',
        ])
        ->and($node['props']['trigger'])->toHaveCount(1)
        ->and($node['props']['trigger'][0]['type'])->toBe('link')
        ->and($node['schema'][0]['type'])->toBe('text');
});

it('serializes explicit side and align', function (): void {
    $node = wire(Popover::make()->side(PopoverSide::Top)->align(PopoverAlign::End));

    expect($node['props'])->toMatchArray([
        'side' => 'top',
        'align' => 'end',
    ]);
});

it('serializes a label', function (): void {
    $node = wire(Popover::make()->label('User card'));

    expect($node['props']['label'])->toBe('User card');
});

it('omits trigger components hidden by a condition', function (): void {
    $node = wire(
        Popover::make()->trigger([
            Text::make('Visible'),
            Text::make('Hidden')->hidden(),
        ]),
    );

    expect($node['props']['trigger'])->toHaveCount(1)
        ->and($node['props']['trigger'][0]['props']['text'])->toBe('Visible');
});
