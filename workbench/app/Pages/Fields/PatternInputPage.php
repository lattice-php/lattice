<?php

declare(strict_types=1);

namespace Workbench\App\Pages\Fields;

use Lattice\Core\Attributes\AsPage;
use Workbench\App\Forms\Fields\PatternInputFieldForm;

#[AsPage(route: '/form/fields/pattern-input')]
final class PatternInputPage extends FieldPage
{
    protected function form(): string
    {
        return PatternInputFieldForm::class;
    }

    protected function slug(): string
    {
        return 'pattern-input';
    }
}
