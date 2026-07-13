<?php
declare(strict_types=1);

namespace Workbench\App\Pages\Fields;

use Lattice\Lattice\Attributes\AsPage;
use Workbench\App\Forms\Fields\PasswordFieldForm;

#[AsPage(route: '/form/fields/password')]
final class PasswordInputPage extends FieldPage
{
    protected function form(): string
    {
        return PasswordFieldForm::class;
    }

    protected function slug(): string
    {
        return 'password';
    }
}
