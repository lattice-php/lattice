<?php

declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Lattice\Attributes\AsPage;
use Lattice\Lattice\Core\Components\Heading;
use Lattice\Lattice\Core\Components\Stack;
use Lattice\Lattice\Core\Components\Text;
use Lattice\Lattice\Core\Enums\Gap;
use Lattice\Lattice\Core\PageSchema;
use Lattice\SignatureExample\Components\Signature;

#[AsPage(route: '/signature-demo')]
final class SignatureDemoPage extends WorkbenchPage
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
                ]),
        ]);
    }
}
