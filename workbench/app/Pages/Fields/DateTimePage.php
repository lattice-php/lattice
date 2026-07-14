<?php
declare(strict_types=1);

namespace Workbench\App\Pages\Fields;

use Lattice\Lattice\Attributes\AsPage;
use Workbench\App\Forms\Fields\DateTimeFieldsForm;

#[AsPage(route: '/form/fields/date-time')]
final class DateTimePage extends FieldPage
{
    protected function form(): string
    {
        return DateTimeFieldsForm::class;
    }

    protected function slug(): string
    {
        return 'date-time';
    }
}
