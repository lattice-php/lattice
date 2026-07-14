<?php
declare(strict_types=1);

namespace Workbench\App\Pages\Fields;

use Lattice\Lattice\Attributes\AsPage;
use Workbench\App\Forms\Fields\SelectFieldForm;

#[AsPage(route: '/form/fields/select')]
final class SelectPage extends FieldPage
{
    protected function form(): string
    {
        return SelectFieldForm::class;
    }

    protected function slug(): string
    {
        return 'select';
    }
}
