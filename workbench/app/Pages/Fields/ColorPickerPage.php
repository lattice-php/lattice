<?php
declare(strict_types=1);

namespace Workbench\App\Pages\Fields;

use Lattice\Lattice\Attributes\AsPage;
use Workbench\App\Forms\Fields\ColorPickerFieldForm;

#[AsPage(route: '/form/fields/color-picker')]
final class ColorPickerPage extends FieldPage
{
    protected function form(): string
    {
        return ColorPickerFieldForm::class;
    }

    protected function slug(): string
    {
        return 'color-picker';
    }
}
