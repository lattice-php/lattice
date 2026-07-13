<?php
declare(strict_types=1);

namespace Workbench\App\Pages;

use Illuminate\Support\Collection;
use Lattice\Lattice\Attributes\AsPage;
use Lattice\Lattice\Core\Enums\HttpMethod;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Ui\Components\Heading;
use Lattice\Lattice\Ui\Components\Stack;
use Lattice\Lattice\Ui\Components\Text;
use Lattice\Lattice\Ui\Enums\Gap;
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
        $savedTitles = Collection::make($this->blockTitles($saved));

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

    /**
     * @return array<int, string>
     */
    private function blockTitles(mixed $rows): array
    {
        $titles = [];

        foreach (is_array($rows) ? $rows : [] as $row) {
            if (! is_array($row)) {
                continue;
            }

            if (is_string($row['title'] ?? null) && $row['title'] !== '') {
                $titles[] = $row['title'];
            }

            foreach (is_array($row['slots'] ?? null) ? $row['slots'] : [] as $childRows) {
                $titles = [...$titles, ...$this->blockTitles($childRows)];
            }
        }

        return $titles;
    }
}
