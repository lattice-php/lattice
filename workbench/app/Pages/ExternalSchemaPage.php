<?php
declare(strict_types=1);

namespace Workbench\App\Pages;

use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\AsPage;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Integrations\IntegrationRegistry;

#[AsPage(route: '/workbench/external-schema')]
final class ExternalSchemaPage extends WorkbenchPage
{
    public function title(): string
    {
        return __('workbench.pages.external-schema.title');
    }

    public function render(PageSchema $schema, Request $request, IntegrationRegistry $integrations): PageSchema
    {
        return $schema->schema(
            $integrations->resolve('workbench.crm')->schema($request),
        );
    }
}
