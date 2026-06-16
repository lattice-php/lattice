<?php
declare(strict_types=1);

namespace Workbench\App\Pages;

use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\AsPage;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Remote\RemoteSourceRegistry;

#[AsPage(route: '/workbench/remote-schema')]
final class RemoteSchemaPage extends WorkbenchPage
{
    public function title(): string
    {
        return __('workbench.pages.remote-schema.title');
    }

    public function render(PageSchema $schema, Request $request, RemoteSourceRegistry $remoteSources): PageSchema
    {
        return $schema->schema(
            $remoteSources->resolve('workbench.todos')->schema($request),
        );
    }
}
