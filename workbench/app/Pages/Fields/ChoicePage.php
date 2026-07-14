<?php
declare(strict_types=1);

namespace Workbench\App\Pages\Fields;

use Lattice\Lattice\Attributes\AsPage;
use Workbench\App\Forms\Fields\ChoiceFieldForm;

#[AsPage(route: '/form/fields/choice')]
final class ChoicePage extends FieldPage
{
    protected function form(): string
    {
        return ChoiceFieldForm::class;
    }

    protected function slug(): string
    {
        return 'choice';
    }
}
