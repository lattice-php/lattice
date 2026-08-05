<?php
declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Core\Attributes\AsPage;
use Lattice\Ui\Components\Heading;
use Lattice\Ui\PageSchema;

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
