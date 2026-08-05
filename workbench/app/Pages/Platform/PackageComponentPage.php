<?php

declare(strict_types=1);

namespace Workbench\App\Pages\Platform;

use Lattice\Core\Attributes\AsPage;
use Lattice\SignatureExample\Components\Signature;
use Lattice\Ui\Components\Heading;
use Lattice\Ui\Components\Stack;
use Lattice\Ui\Components\Text;
use Lattice\Ui\Enums\Gap;
use Lattice\Ui\PageSchema;
use Workbench\App\Pages\WorkbenchPage;

#[AsPage(route: '/platform/package')]
final class PackageComponentPage extends WorkbenchPage
{
    public function title(): string
    {
        return 'Signature demo';
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([
            Stack::make('signature-demo')
                ->gap(Gap::Large)
                ->schema([
                    Heading::make('Signature demo'),
                    Text::make('A component contributed by a third-party Composer package.'),
                    Signature::make('signature')->label('Vendor component rendered'),
                    Signature::make('signature-default'),
                ]),
        ]);
    }
}
