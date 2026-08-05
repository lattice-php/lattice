<?php
declare(strict_types=1);

namespace Workbench\App\Pages\Components;

use Illuminate\Support\Facades\File;
use Lattice\Core\Attributes\AsPage;
use Lattice\Ui\Components\CodeBlock;
use Lattice\Ui\Components\Heading;
use Lattice\Ui\Components\Stack;
use Lattice\Ui\Enums\CodeBlockLanguage;
use Lattice\Ui\Enums\Gap;
use Lattice\Ui\PageSchema;
use Workbench\App\Pages\WorkbenchPage;

#[AsPage(route: '/components/code-blocks')]
final class CodeBlocksPage extends WorkbenchPage
{
    public function title(): string
    {
        return __('workbench.pages.components.code-blocks.title');
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([
            Stack::make('code-blocks-page')
                ->gap(Gap::ExtraLarge)
                ->schema([
                    Heading::make($this->title()),
                    Heading::make(__('workbench.pages.components.code-blocks.json'), 2),
                    CodeBlock::make(<<<'JSON'
{
    "name": "Lattice",
    "language": "PHP"
}
JSON, 'code-block-json')->language(CodeBlockLanguage::Json),
                    Heading::make(__('workbench.pages.components.code-blocks.php'), 2),
                    CodeBlock::make(File::get(__FILE__), 'code-block-php')
                        ->language(CodeBlockLanguage::Php)
                        ->copyable()
                        ->lineNumbers()
                        ->maxHeight(320)
                        ->wrap(),
                ]),
        ]);
    }
}
