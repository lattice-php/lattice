<?php
declare(strict_types=1);

namespace Workbench\App\Pages\Fields;

use Lattice\Lattice\Attributes\AsPage;
use Workbench\App\Forms\Fields\TextareaFieldForm;

#[AsPage(route: '/form/fields/textarea')]
final class TextareaPage extends FieldPage
{
    protected function form(): string
    {
        return TextareaFieldForm::class;
    }

    protected function slug(): string
    {
        return 'textarea';
    }
}
