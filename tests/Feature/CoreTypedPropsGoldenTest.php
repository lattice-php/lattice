<?php

declare(strict_types=1);

use Lattice\Lattice\Core\Components\Modal;
use Lattice\Lattice\Core\Components\SegmentedControl;
use Lattice\Lattice\Core\Components\Stack;
use Lattice\Lattice\Core\Components\Tab;
use Lattice\Lattice\Core\Components\Tabs;
use Lattice\Lattice\Core\Components\Text;
use Lattice\Lattice\Core\Enums\Align;
use Lattice\Lattice\Core\Enums\Gap;
use Lattice\Lattice\Core\Enums\Width;

test('GOLDEN stack serializes enums direction and key wire-identically', function () {
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
            ],
            'schema' => [
                ['type' => 'text', 'props' => ['text' => 'Body', 'align' => null]],
            ],
        ]);
});

test('GOLDEN segmented control serializes name label value emits options', function () {
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

test('GOLDEN modal serializes id title description and children', function () {
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
                ['type' => 'text', 'props' => ['text' => 'Body', 'align' => null]],
            ],
        ]);
});

test('GOLDEN modal without optional props includes them as null', function () {
    expect(wire(Modal::make('bare.modal')))
        ->toEqual([
            'type' => 'modal',
            'id' => 'bare.modal',
            'props' => [
                'title' => null,
                'description' => null,
                'closeLabel' => null,
                'open' => false,
                'ref' => null,
            ],
        ]);
});

test('GOLDEN tabs serialize defaultValue queryKey and computed activeValue', function () {
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
                'defaultValue' => 'security',
                'activeValue' => 'security',
            ],
            'schema' => [
                [
                    'type' => 'tab',
                    'props' => ['label' => 'Profile', 'value' => 'profile', 'confirm' => null],
                    'schema' => [['type' => 'text', 'props' => ['text' => 'Profile form', 'align' => null]]],
                ],
                [
                    'type' => 'tab',
                    'props' => ['label' => 'Security', 'value' => 'security', 'confirm' => null],
                    'schema' => [['type' => 'text', 'props' => ['text' => 'Security form', 'align' => null]]],
                ],
            ],
        ]);
});

test('GOLDEN tabs with custom queryKey and no defaultValue keep empty activeValue', function () {
    expect(wire(Tabs::make('settings-tabs')->queryKey('settings-tab')))
        ->toEqual([
            'type' => 'tabs',
            'key' => 'settings-tabs',
            'props' => [
                'queryKey' => 'settings-tab',
                'activeValue' => '',
                'defaultValue' => null,
            ],
        ]);
});

test('GOLDEN confirmed inactive tab serializes confirm metadata and drops its children', function () {
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

test('GOLDEN tab confirm keeps a provided timeout and custom redirect', function () {
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
