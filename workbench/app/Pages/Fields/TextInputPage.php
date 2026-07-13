<?php
declare(strict_types=1);

namespace Workbench\App\Pages\Fields;

use Lattice\Lattice\Attributes\AsPage;
use Workbench\App\Forms\Fields\TextInputFieldForm;

#[AsPage(route: '/form/fields/text')]
final class TextInputPage extends FieldPage
{
    protected function form(): string
    {
        return TextInputFieldForm::class;
    }

    protected function slug(): string
    {
        return 'text';
    }
}
