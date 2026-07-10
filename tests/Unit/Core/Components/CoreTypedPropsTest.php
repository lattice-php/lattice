<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Components\Icon;
use Lattice\Lattice\Core\Components\Modal;
use Lattice\Lattice\Core\Components\SegmentedControl;
use Lattice\Lattice\Core\Components\Stack;
use Lattice\Lattice\Core\Components\Tab;
use Lattice\Lattice\Core\Components\Tabs;
use Lattice\Lattice\Core\Components\Text;
use Lattice\Lattice\Core\Enums\Align;
use Lattice\Lattice\Core\Enums\Color;
use Lattice\Lattice\Core\Enums\Gap;
use Lattice\Lattice\Core\Enums\Icon as IconName;
use Lattice\Lattice\Core\Enums\Justify;
use Lattice\Lattice\Core\Enums\Orientation;
use Lattice\Lattice\Core\Enums\Size;
use Lattice\Lattice\Core\Enums\TabsAlignment;
use Lattice\Lattice\Core\Enums\Width;

test('stack serializes enums direction and key wire-identically', function (): void {
    expect(wire(Stack::make('layout')
        ->direction('row')
        ->gap(Gap::Large)
        ->align(Align::Center)
        ->width(Width::Small)
        ->schema([Text::make('Body')])))
        ->toEqual([
            'type' => 'stack',
            'key' => 'layout',
            'props' => [
                'gap' => 'lg',
                'align' => 'center',
                'width' => 'sm',
                'direction' => 'row',
                'justify' => null,
                'height' => null,
                'float' => null,
            ],
            'schema' => [
                ['type' => 'text', 'props' => ['text' => 'Body', 'align' => null, 'size' => 'md', 'color' => null, 'copyable' => false]],
            ],
        ]);
});

test('segmented control serializes name label value emits options', function (): void {
    expect(wire(SegmentedControl::make('appearance', 'Appearance')
        ->value('system')
        ->emits('lattice:appearance-change')
        ->options([
            SegmentedControl::option('Light', 'light'),
            SegmentedControl::option('Dark', 'dark'),
        ])))
        ->toEqual([
            'type' => 'segmented-control',
            'props' => [
                'name' => 'appearance',
                'label' => 'Appearance',
                'value' => 'system',
                'emits' => 'lattice:appearance-change',
                'options' => [
                    ['label' => 'Light', 'value' => 'light'],
                    ['label' => 'Dark', 'value' => 'dark'],
                ],
            ],
        ]);
});

test('modal serializes id title description and children', function (): void {
    expect(wire(Modal::make('settings.modal')
        ->title('Title')
        ->description('Desc')
        ->closeLabel('Close')
        ->open()
        ->schema([Text::make('Body')])))
        ->toEqual([
            'type' => 'modal',
            'id' => 'settings.modal',
            'props' => [
                'title' => 'Title',
                'description' => 'Desc',
                'closeLabel' => 'Close',
                'open' => true,
                'ref' => null,
            ],
            'schema' => [
                ['type' => 'text', 'props' => ['text' => 'Body', 'align' => null, 'size' => 'md', 'color' => null, 'copyable' => false]],
            ],
        ]);
});

test('modal without optional props includes them as null', function (): void {
    expect(wire(Modal::make('bare.modal')))
        ->toEqual([
            'type' => 'modal',
            'id' => 'bare.modal',
            'props' => [
                'title' => null,
                'description' => null,
                'closeLabel' => 'Close',
                'open' => false,
                'ref' => null,
            ],
        ]);
});

test('tabs serialize defaultValue queryKey and computed activeValue', function (): void {
    expect(wire(Tabs::make('settings-tabs')
        ->defaultValue('security')
        ->schema([
            Tab::make('profile', 'Profile')->schema([Text::make('Profile form')]),
            Tab::make('security', 'Security')->schema([Text::make('Security form')]),
        ])))
        ->toEqual([
            'type' => 'tabs',
            'key' => 'settings-tabs',
            'props' => [
                'queryKey' => 'tabs',
                'orientation' => 'horizontal',
                'alignment' => 'stretch',
                'defaultValue' => 'security',
                'activeValue' => 'security',
            ],
            'schema' => [
                [
                    'type' => 'tab',
                    'props' => ['label' => 'Profile', 'value' => 'profile', 'confirm' => null],
                    'schema' => [['type' => 'text', 'props' => ['text' => 'Profile form', 'align' => null, 'size' => 'md', 'color' => null, 'copyable' => false]]],
                ],
                [
                    'type' => 'tab',
                    'props' => ['label' => 'Security', 'value' => 'security', 'confirm' => null],
                    'schema' => [['type' => 'text', 'props' => ['text' => 'Security form', 'align' => null, 'size' => 'md', 'color' => null, 'copyable' => false]]],
                ],
            ],
        ]);
});

test('tabs with custom queryKey and no defaultValue keep empty activeValue', function (): void {
    expect(wire(Tabs::make('settings-tabs')->queryKey('settings-tab')))
        ->toEqual([
            'type' => 'tabs',
            'key' => 'settings-tabs',
            'props' => [
                'queryKey' => 'settings-tab',
                'orientation' => 'horizontal',
                'alignment' => 'stretch',
                'activeValue' => '',
                'defaultValue' => null,
            ],
        ]);
});

test('tabs serialize a vertical orientation', function (): void {
    expect(wire(Tabs::make('settings-tabs')->orientation(Orientation::Vertical))['props']['orientation'])
        ->toBe('vertical');
});

test('tabs serialize a stretched alignment by default and honour an override', function (): void {
    expect(wire(Tabs::make('settings-tabs'))['props']['alignment'])->toBe('stretch');

    expect(wire(Tabs::make('settings-tabs')->alignment(TabsAlignment::Center))['props']['alignment'])
        ->toBe('center');
});

test('confirmed inactive tab serializes confirm metadata and drops its children', function (): void {
    $tabs = wire(Tabs::make('settings-tabs')
        ->defaultValue('profile')
        ->schema([
            Tab::make('profile', 'Profile')->schema([Text::make('Profile form')]),
            Tab::make('security', 'Security')->confirm()->schema([Text::make('Security form')]),
        ]));

    expect($tabs['schema'][1])->toEqual([
        'type' => 'tab',
        'props' => [
            'label' => 'Security',
            'value' => 'security',
            'confirm' => [
                'required' => true,
                'redirectUrl' => '/user/confirm-password',
            ],
        ],
    ]);
});

test('tab confirm keeps a provided timeout and custom redirect', function (): void {
    expect(wire(Tab::make('security', 'Security')->confirm('/auth/confirm', 60)))
        ->toEqual([
            'type' => 'tab',
            'props' => [
                'label' => 'Security',
                'value' => 'security',
                'confirm' => [
                    'required' => true,
                    'redirectUrl' => '/auth/confirm',
                    'timeout' => 60,
                ],
            ],
        ]);
});

it('serializes the justify prop', function (): void {
    $node = wire(Stack::make()->justify(Justify::Between));

    expect($node['props']['justify'])->toBe('between');
});

it('serializes default text styling props', function (): void {
    $props = wire(Text::make('Default copy'))['props'];

    expect($props)->toHaveCount(5)
        ->and($props)->toMatchArray([
            'text' => 'Default copy',
            'align' => null,
            'size' => 'md',
            'color' => null,
            'copyable' => false,
        ]);
});

it('serializes text size and color styling', function (): void {
    $data = wire(
        Text::make('Manuel Christlieb')
            ->align(Align::Center)
            ->size(Size::Sm)
            ->color(Color::Default),
    );

    expect($data['type'])->toBe('text')
        ->and($data['props'])->toHaveCount(5)
        ->and($data['props'])->toMatchArray([
            'text' => 'Manuel Christlieb',
            'align' => 'center',
            'size' => 'sm',
            'color' => 'default',
            'copyable' => false,
        ]);
});

it('marks text as copyable', function (): void {
    expect(wire(Text::make('tok_secret')->copyable())['props']['copyable'])->toBeTrue();
});

it('serializes an icon with name, size, color and class', function (): void {
    $data = wire(
        Icon::make('house')->size(Size::Lg)->color(Color::Danger)->class('opacity-80'),
    );

    expect($data['type'])->toBe('icon')
        ->and($data['props'])->toHaveCount(4)
        ->and($data['props'])->toMatchArray([
            'name' => 'house',
            'size' => 'lg',
            'color' => 'danger',
            'class' => 'opacity-80',
        ]);
});

it('resolves a backed enum name and defaults size to md', function (): void {
    $data = wire(Icon::make(IconName::Send));

    expect($data['type'])->toBe('icon')
        ->and($data['props'])->toHaveCount(4)
        ->and($data['props'])->toMatchArray([
            'name' => 'send',
            'size' => 'md',
            'color' => null,
            'class' => null,
        ]);
});
