<?php
declare(strict_types=1);

use Lattice\Core\Color;
use Lattice\Ui\Components\Icon;
use Lattice\Ui\Components\Modal;
use Lattice\Ui\Components\SegmentedControl;
use Lattice\Ui\Components\Stack;
use Lattice\Ui\Components\Tab;
use Lattice\Ui\Components\Tabs;
use Lattice\Ui\Components\Text;
use Lattice\Ui\Enums\Align;
use Lattice\Ui\Enums\Gap;
use Lattice\Ui\Enums\Icon as IconName;
use Lattice\Ui\Enums\Justify;
use Lattice\Ui\Enums\ModalHeight;
use Lattice\Ui\Enums\ModalWidth;
use Lattice\Ui\Enums\Orientation;
use Lattice\Ui\Enums\Side;
use Lattice\Ui\Enums\Size;
use Lattice\Ui\Enums\TextAlign;
use Lattice\Ui\Enums\Width;

it('stack serializes enums direction and key wire-identically', function (): void {
    expect(wire(Stack::make('layout')
        ->direction(Orientation::Horizontal)
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
                'direction' => 'horizontal',
                'justify' => null,
                'height' => null,
                'float' => null,
                'sticky' => false,
            ],
            'schema' => [
                ['type' => 'text', 'props' => ['text' => 'Body', 'align' => null, 'size' => 'md', 'color' => null, 'copyable' => false]],
            ],
        ]);
});

it('segmented control serializes name label value emits options', function (): void {
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
                    ['label' => 'Light', 'value' => 'light', 'data' => null],
                    ['label' => 'Dark', 'value' => 'dark', 'data' => null],
                ],
            ],
        ]);
});

it('modal serializes id title description and children', function (): void {
    expect(wire(Modal::make('settings.modal')
        ->title('Title')
        ->description('Desc')
        ->closeLabel('Close')
        ->schema([Text::make('Body')])))
        ->toEqual([
            'type' => 'modal',
            'id' => 'settings.modal',
            'props' => [
                'title' => 'Title',
                'description' => 'Desc',
                'closeLabel' => 'Close',
                'side' => null,
                'width' => 'lg',
                'height' => 'lg',
            ],
            'schema' => [
                ['type' => 'text', 'props' => ['text' => 'Body', 'align' => null, 'size' => 'md', 'color' => null, 'copyable' => false]],
            ],
        ]);
});

it('modal without optional props includes them as null', function (): void {
    expect(wire(Modal::make('bare.modal')))
        ->toEqual([
            'type' => 'modal',
            'id' => 'bare.modal',
            'props' => [
                'title' => null,
                'description' => null,
                'closeLabel' => 'Close',
                'side' => null,
                'width' => 'lg',
                'height' => 'lg',
            ],
        ]);
});

it('modal serializes slide-out side and width', function (): void {
    $payload = wire(Modal::make('order.preview')
        ->slideOut(Side::Start)
        ->width(ModalWidth::Xl2));

    expect($payload['props'])->toMatchArray([
        'side' => 'start',
        'width' => '2xl',
    ]);
});

it('modal serializes a custom height', function (): void {
    $payload = wire(Modal::make('order.preview')->height(ModalHeight::Xl2));

    expect($payload['props'])->toMatchArray(['height' => '2xl']);
});

it('modal serializes the max width and height', function (): void {
    $payload = wire(Modal::make('template.editor')
        ->width(ModalWidth::Max)
        ->height(ModalHeight::Max));

    expect($payload['props'])->toMatchArray(['width' => 'max', 'height' => 'max']);
});

it('modal slide-out defaults to the end side', function (): void {
    expect(wire(Modal::make('order.preview')->slideOut())['props'])
        ->toMatchArray(['side' => 'end', 'width' => 'lg']);
});

it('tabs serialize defaultValue queryKey and computed activeValue', function (): void {
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
                'sticky' => false,
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

it('tabs with custom queryKey and no defaultValue keep empty activeValue', function (): void {
    expect(wire(Tabs::make('settings-tabs')->queryKey('settings-tab')))
        ->toEqual([
            'type' => 'tabs',
            'key' => 'settings-tabs',
            'props' => [
                'queryKey' => 'settings-tab',
                'orientation' => 'horizontal',
                'alignment' => 'stretch',
                'sticky' => false,
                'activeValue' => '',
                'defaultValue' => null,
            ],
        ]);
});

it('tabs serialize a vertical orientation', function (): void {
    expect(wire(Tabs::make('settings-tabs')->orientation(Orientation::Vertical))['props']['orientation'])
        ->toBe('vertical');
});

it('tabs serialize a stretched alignment by default and honour an override', function (): void {
    expect(wire(Tabs::make('settings-tabs'))['props']['alignment'])->toBe('stretch');

    expect(wire(Tabs::make('settings-tabs')->alignment(Align::Center))['props']['alignment'])
        ->toBe('center');
});

it('confirmed inactive tab serializes confirm metadata and drops its children', function (): void {
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
                'timeout' => null,
            ],
        ],
    ]);
});

it('tab confirm keeps a provided timeout and custom redirect', function (): void {
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

it('serializes text size and color styling', function (): void {
    $data = wire(
        Text::make('Manuel Christlieb')
            ->align(TextAlign::Center)
            ->size(Size::Sm)
            ->color(Color::default()),
    );

    expect($data['type'])->toBe('text')
        ->and($data['props'])->toHaveCount(5)
        ->and($data['props'])->toMatchArray([
            'text' => 'Manuel Christlieb',
            'align' => 'center',
            'size' => 'sm',
            'color' => ['kind' => 'named', 'value' => 'default', 'dark' => null],
            'copyable' => false,
        ]);
});

it('marks text as copyable', function (): void {
    expect(wire(Text::make('tok_secret')->copyable())['props']['copyable'])->toBeTrue();
});

it('serializes an icon with name, size, color and class', function (): void {
    $data = wire(
        Icon::make('house')->size(Size::Lg)->color(Color::danger())->class('opacity-80'),
    );

    expect($data['type'])->toBe('icon')
        ->and($data['props'])->toHaveCount(4)
        ->and($data['props'])->toMatchArray([
            'name' => 'house',
            'size' => 'lg',
            'color' => ['kind' => 'named', 'value' => 'danger', 'dark' => null],
            'class' => 'opacity-80',
        ]);
});

it('resolves a backed enum name and defaults size to md', function (): void {
    $data = wire(Icon::make(IconName::Send));

    expect($data['type'])->toBe('icon')
        ->and($data['props'])->toHaveCount(3)
        ->and($data['props'])->toMatchArray([
            'name' => 'send',
            'size' => 'md',
            'color' => null,
        ]);
});
