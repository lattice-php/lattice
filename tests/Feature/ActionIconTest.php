<?php

declare(strict_types=1);

use Bambamboole\Lattice\Core\Components\Action;
use Bambamboole\Lattice\Core\LucideIcon;

test('actions serialize lucide icon enum values', function () {
    expect(Action::make('send-message')
        ->label('Send')
        ->icon(LucideIcon::Send)
        ->toArray())
        ->toMatchArray([
            'type' => 'action',
            'id' => 'send-message',
            'props' => [
                'label' => 'Send',
                'icon' => 'send',
            ],
        ]);
});

test('actions serialize arbitrary backed enum icon values', function () {
    expect(Action::make('custom-action')
        ->label('Custom')
        ->icon(WorkbenchCustomActionIcon::Spark)
        ->toArray()['props']['icon'])
        ->toBe('custom.spark');
});

enum WorkbenchCustomActionIcon: string
{
    case Spark = 'custom.spark';
}
