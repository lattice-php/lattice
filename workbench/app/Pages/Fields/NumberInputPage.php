<?php
declare(strict_types=1);

namespace Workbench\App\Pages\Fields;

use Lattice\Lattice\Attributes\AsPage;
use Workbench\App\Forms\Fields\NumberInputFieldForm;

#[AsPage(route: '/form/fields/number')]
final class NumberInputPage extends FieldPage
{
    protected function form(): string
    {
        return NumberInputFieldForm::class;
    }

    protected function slug(): string
    {
        return 'number';
    }
}
