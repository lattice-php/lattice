<?php
declare(strict_types=1);

namespace Workbench\App\Pages\Fields;

use Lattice\Lattice\Attributes\AsPage;
use Workbench\App\Forms\Fields\BooleanFieldsForm;

#[AsPage(route: '/form/fields/boolean')]
final class BooleanFieldsPage extends FieldPage
{
    protected function form(): string
    {
        return BooleanFieldsForm::class;
    }

    protected function slug(): string
    {
        return 'boolean';
    }
}
