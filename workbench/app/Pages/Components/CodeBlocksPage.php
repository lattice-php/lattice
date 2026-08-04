<?php
declare(strict_types=1);

namespace Workbench\App\Pages\Components;

use Illuminate\Support\Facades\File;
use Lattice\Lattice\Attributes\AsPage;
use Lattice\Lattice\Ui\Components\CodeBlock;
use Lattice\Lattice\Ui\Components\Heading;
use Lattice\Lattice\Ui\Components\Stack;
use Lattice\Lattice\Ui\Enums\CodeBlockLanguage;
use Lattice\Lattice\Ui\Enums\Gap;
use Lattice\Lattice\Ui\PageSchema;
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
