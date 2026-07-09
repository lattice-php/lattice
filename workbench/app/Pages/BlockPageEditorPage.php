<?php
declare(strict_types=1);

namespace Workbench\App\Pages;

use Illuminate\Support\Collection;
use Lattice\Lattice\Attributes\AsPage;
use Lattice\Lattice\Core\Components\Heading;
use Lattice\Lattice\Core\Components\Stack;
use Lattice\Lattice\Core\Components\Text;
use Lattice\Lattice\Core\Enums\Gap;
use Lattice\Lattice\Core\Enums\HttpMethod;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Forms\Components\Form;
use Workbench\App\Forms\BlockPageForm;

#[AsPage(route: '/block-editor')]
class BlockPageEditorPage extends WorkbenchPage
{
    public function title(): string
    {
        return __('workbench.pages.block-editor.title');
    }

    public function render(PageSchema $schema): PageSchema
    {
        $saved = session('block-editor.saved');
        $savedTitles = Collection::make(is_array($saved) ? $saved : [])
            ->pluck('title')
            ->filter(fn (mixed $title): bool => is_string($title) && $title !== '');

        return $schema->schema([
            Stack::make('block-editor-page')
                ->gap(Gap::Large)
                ->schema([
                    Heading::make(__('workbench.pages.block-editor.heading')),
                    Form::use(BlockPageForm::class)
                        ->method(HttpMethod::Post)
                        ->submitLabel(__('workbench.pages.block-editor.submit')),
                    ...($saved !== null
                        ? [Text::make(__('workbench.pages.block-editor.saved', ['titles' => $savedTitles->implode(', ')]))]
                        : []),
                ]),
        ]);
    }
}
