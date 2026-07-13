<?php
declare(strict_types=1);

namespace Workbench\App\Pages\Fields;

use Lattice\Lattice\Attributes\AsPage;
use Workbench\App\Forms\Fields\BuilderFieldForm;

#[AsPage(route: '/form/fields/builder')]
final class BuilderPage extends FieldPage
{
    protected function form(): string
    {
        return BuilderFieldForm::class;
    }

    protected function slug(): string
    {
        return 'builder';
    }
}
