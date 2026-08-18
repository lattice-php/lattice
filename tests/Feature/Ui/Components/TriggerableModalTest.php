<?php
declare(strict_types=1);

use Lattice\Layouts\Components\MenuItem;
use Lattice\Ui\Components\Button;
use Lattice\Ui\Components\Link;
use Lattice\Ui\Components\Modal;
use Lattice\Ui\Components\Text;

it('embeds a modal node in a button', function (): void {
    $wire = wire(Button::make('Details')->modal(
        Modal::make('order-details')->title('Order details')->schema([Text::make('Body')]),
    ));

    expect($wire['props']['modal']['type'])->toBe('modal')
        ->and($wire['props']['modal']['id'])->toBe('order-details')
        ->and($wire['props']['modal']['props']['title'])->toBe('Order details')
        ->and($wire['props']['modal']['schema'][0]['type'])->toBe('text')
        ->and($wire['props']['modal']['schema'][0]['props']['text'])->toBe('Body');
});

it('embeds a modal node in a link', function (): void {
    $wire = wire(Link::make('Preview')->modal(Modal::make('preview')->title('Preview')));

    expect($wire['props']['modal']['type'])->toBe('modal')
        ->and($wire['props']['modal']['id'])->toBe('preview');
});

it('rejects a modal after an href is set', function (): void {
    expect(fn (): Button => Button::make('Details')->href('/x')->modal(Modal::make('x')))
        ->toThrow(InvalidArgumentException::class, 'only one of an href, an action, effects, or a modal');
});

it('rejects an href after a modal is set', function (): void {
    expect(fn (): Button => Button::make('Details')->modal(Modal::make('x'))->href('/x'))
        ->toThrow(InvalidArgumentException::class, 'only one of an href, an action, effects, or a modal');
});

it('rejects a menu item with children when it already carries a modal', function (): void {
    expect(fn (): MenuItem => MenuItem::make('Account')->modal(Modal::make('x'))->children([
        MenuItem::make('Profile')->href('/profile'),
    ]))->toThrow(InvalidArgumentException::class, 'cannot have children');
});

it('rejects a modal on a menu item that already has children', function (): void {
    expect(fn (): MenuItem => MenuItem::make('Account')->children([
        MenuItem::make('Profile')->href('/profile'),
    ])->modal(Modal::make('x')))->toThrow(InvalidArgumentException::class, 'cannot be a link, action, effect, or modal trigger');
});

it('resolves a modal closure at serialization time against the render context', function (): void {
    $wire = wire(Button::make('Details')->modal(fn (): Modal => Modal::make('resolved')->title('Resolved')));

    expect($wire['props']['modal']['id'])->toBe('resolved')
        ->and($wire['props']['modal']['props']['title'])->toBe('Resolved');
});

it('throws when the modal closure does not return a Modal', function (): void {
    expect(fn (): array => wire(Button::make('Details')->modal(fn (): string => 'not-a-modal')))
        ->toThrow(InvalidArgumentException::class, 'must return a Modal');
});

it('strips a non-renderable embedded modal instead of throwing', function (): void {
    $wire = wire(Button::make('Details')->modal(Modal::make('hidden')->visible(false)));

    expect($wire['props']['modal'])->toBeNull();
});

it('strips an unauthorized embedded modal resolved from a closure', function (): void {
    $wire = wire(Button::make('Details')->modal(fn (): Modal => Modal::make('hidden')->visible(false)));

    expect($wire['props']['modal'])->toBeNull();
});
