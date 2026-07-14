<?php
declare(strict_types=1);

namespace Workbench\App\Pages\Fields;

use Lattice\Lattice\Attributes\AsPage;
use Workbench\App\Forms\Fields\OtpFieldForm;

#[AsPage(route: '/form/fields/otp')]
final class OtpInputPage extends FieldPage
{
    protected function form(): string
    {
        return OtpFieldForm::class;
    }

    protected function slug(): string
    {
        return 'otp';
    }
}
