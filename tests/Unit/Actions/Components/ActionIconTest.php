<?php
declare(strict_types=1);

use Lattice\Lattice\Actions\Components\Action;
use Lattice\Lattice\Core\Enums\Icon;

test('actions serialize lucide icon enum values', function (): void {
    expect(wire(Action::make('send-message')
        ->label('Send')
        ->icon(Icon::Send)))
        ->toMatchArray([
            'type' => 'action',
            'id' => 'send-message',
            'props' => [
                'label' => 'Send',
                'icon' => 'send',
                'endpoint' => null,
                'method' => null,
                'confirmation' => null,
                'effects' => [],
                'form' => null,
                'lazyForm' => null,
                'variant' => null,
                'ref' => null,
            ],
        ]);
});

test('actions serialize arbitrary backed enum icon values', function (): void {
    expect(wire(Action::make('custom-action')
        ->label('Custom')
        ->icon(WorkbenchCustomActionIcon::Spark))['props']['icon'])
        ->toBe('custom.spark');
});

enum WorkbenchCustomActionIcon: string
{
    case Spark = 'custom.spark';
}
