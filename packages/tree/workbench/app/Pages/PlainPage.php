<?php
declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Lattice\Attributes\AsPage;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Ui\Components\Heading;

#[AsPage(route: '/plain')]
final class PlainPage extends WorkbenchPage
{
    public function title(): string
    {
        return 'Plain';
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([Heading::make('Plain page')]);
    }
}
