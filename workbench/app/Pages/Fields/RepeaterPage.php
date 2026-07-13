<?php
declare(strict_types=1);

namespace Workbench\App\Pages\Fields;

use Lattice\Lattice\Attributes\AsPage;
use Workbench\App\Forms\Fields\RepeaterFieldForm;

#[AsPage(route: '/form/fields/repeater')]
final class RepeaterPage extends FieldPage
{
    protected function form(): string
    {
        return RepeaterFieldForm::class;
    }

    protected function slug(): string
    {
        return 'repeater';
    }
}
