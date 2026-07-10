<?php
declare(strict_types=1);

use Lattice\Lattice\Ui\Components\Button;
use Lattice\Lattice\Ui\Components\Section;
use Lattice\Lattice\Ui\Components\Text;

it('serializes a section with its content and header', function (): void {
    $node = wire(
        Section::make('Members', 'People with access.')
            ->headerActions([Button::make('Invite')])
            ->schema([Text::make('Three people have access.')]),
    );

    expect($node['type'])->toBe('section')
        ->and($node['props'])->toMatchArray([
            'title' => 'Members',
            'description' => 'People with access.',
            'collapsible' => false,
            'collapsed' => false,
            'rememberState' => true,
        ])
        ->and($node['props']['headerActions'])->toHaveCount(1)
        ->and($node['props']['headerActions'][0]['type'])->toBe('button')
        ->and($node['schema'][0]['type'])->toBe('text');
});

it('serializes the collapsible flags', function (): void {
    $node = wire(Section::make('Advanced')->collapsible(collapsed: true, rememberState: false));

    expect($node['props'])->toMatchArray([
        'collapsible' => true,
        'collapsed' => true,
        'rememberState' => false,
    ]);
});

it('serializes a section tooltip', function (): void {
    $node = wire(Section::make('Members')->tooltip('People with access.'));

    expect($node['props']['tooltip'])->toBe('People with access.');
});
