<?php
declare(strict_types=1);

namespace Workbench\App\Pages\Platform;

use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\AsPage;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Remote\RemoteSourceRegistry;
use Workbench\App\Pages\WorkbenchPage;

#[AsPage(route: '/platform/remote-schema')]
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
