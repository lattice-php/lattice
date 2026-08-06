<?php
declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\ApiReference\ApiReference;
use Lattice\Core\Attributes\AsPage;
use Lattice\Ui\PageSchema;

#[AsPage(route: '/api-reference')]
final class ApiReferencePage extends WorkbenchPage
{
    public function title(): string
    {
        return 'API Reference';
    }

    public function render(PageSchema $schema): PageSchema
    {
        /** @var array<string, mixed> $document */
        $document = json_decode(
            (string) file_get_contents(dirname(__DIR__, 2).'/fixtures/openapi.json'),
            true,
            flags: JSON_THROW_ON_ERROR,
        );
        $document['servers'] = [['url' => '/api']];

        return $schema->schema([
            ApiReference::make()
                ->spec($document)
                ->token('workbench-token'),
        ]);
    }
}
