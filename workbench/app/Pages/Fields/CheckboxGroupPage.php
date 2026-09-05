<?php
declare(strict_types=1);

namespace Workbench\App\Pages\Fields;

use Lattice\Core\Attributes\AsPage;
use Workbench\App\Forms\Fields\CheckboxGroupFieldForm;

#[AsPage(route: '/form/fields/checkbox-group')]
final class CheckboxGroupPage extends FieldPage
{
    protected function form(): string
    {
        return CheckboxGroupFieldForm::class;
    }

    protected function slug(): string
    {
        return 'checkbox-group';
    }

    /** @return array<string, mixed> */
    #[\Override]
    protected function fill(): array
    {
        return ['permissions' => ['order:view']];
    }
}
