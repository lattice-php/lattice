<?php
declare(strict_types=1);

namespace Workbench\App\Pages\Fields;

use Lattice\Core\Attributes\AsPage;
use Workbench\App\Forms\Fields\TreeFieldForm;

#[AsPage(route: '/form/fields/tree')]
final class TreePage extends FieldPage
{
    protected function form(): string
    {
        return TreeFieldForm::class;
    }

    protected function slug(): string
    {
        return 'tree';
    }

    protected function fill(): array
    {
        return [
            'items' => [
                [
                    'type' => 'heading',
                    'title' => 'Hardware',
                    'children' => [
                        ['type' => 'product', 'product' => 'Switch', 'qty' => '2'],
                        ['type' => 'text', 'content' => 'Includes patch cabling.'],
                    ],
                ],
                ['type' => 'product', 'product' => 'Installation', 'qty' => '1'],
            ],
        ];
    }
}
