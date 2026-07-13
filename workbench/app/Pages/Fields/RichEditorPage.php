<?php
declare(strict_types=1);

namespace Workbench\App\Pages\Fields;

use Lattice\Lattice\Attributes\AsPage;
use Workbench\App\Forms\Fields\RichEditorFieldForm;

#[AsPage(route: '/form/fields/rich-editor')]
final class RichEditorPage extends FieldPage
{
    protected function form(): string
    {
        return RichEditorFieldForm::class;
    }

    protected function slug(): string
    {
        return 'rich-editor';
    }
}
