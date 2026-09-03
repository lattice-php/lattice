<?php
declare(strict_types=1);

namespace Workbench\App\BlockEditors;

use Illuminate\Support\Facades\DB;
use Lattice\Blocks\Attributes\AsBlockEditor;
use Lattice\Blocks\BlockDocument;
use Lattice\Blocks\BlockEditorDefinition;
use Lattice\Blocks\BlockNode;
use Lattice\Blocks\BlockPattern;
use Lattice\Blocks\Builtin\Builtin;
use Lattice\Blocks\Exceptions\StaleRevision;
use Lattice\Ui\Enums\Icon;
use Workbench\App\Blocks\CtaBlock;
use Workbench\App\Blocks\HeroBlock;
use Workbench\App\Models\Page;

#[AsBlockEditor('workbench.pages')]
final class PagesEditor extends BlockEditorDefinition
{
    public function blocks(): array
    {
        return [HeroBlock::class, CtaBlock::class, ...Builtin::all()];
    }

    public function patterns(): array
    {
        return [
            BlockPattern::make('hero-cta')
                ->label(__('workbench.blocks.patterns.hero-cta.label'))
                ->description(__('workbench.blocks.patterns.hero-cta.description'))
                ->icon(Icon::LayoutTemplate)
                ->blocks([
                    BlockNode::make('workbench.hero', [
                        'title' => 'Your headline',
                        'intro' => $this->paragraph('One sentence that says what this page is about.'),
                        'button_label' => 'Get started',
                        'button_target' => '/demo',
                    ]),
                    BlockNode::make('workbench.cta', [
                        'title' => 'Ready to begin?',
                        'text' => 'It takes five minutes.',
                        'button_label' => 'Create account',
                    ]),
                ]),
            BlockPattern::make('text-image')
                ->label(__('workbench.blocks.patterns.text-image.label'))
                ->description(__('workbench.blocks.patterns.text-image.description'))
                ->icon(Icon::Columns2)
                ->blocks([
                    BlockNode::make('lattice.columns', ['count' => '2'], [
                        'col_1' => [
                            BlockNode::make('lattice.heading', ['text' => 'Why it matters', 'level' => '3']),
                            BlockNode::make('lattice.paragraph', ['content' => $this->paragraph('Explain the benefit in two or three sentences.')]),
                        ],
                        'col_2' => [BlockNode::make('lattice.image')],
                    ]),
                ]),
        ];
    }

    public function load(): BlockDocument
    {
        return $this->page()->draft ?? BlockDocument::empty();
    }

    public function revision(): int
    {
        return $this->page()->revision;
    }

    public function saveDraft(BlockDocument $document, int $revision): int
    {
        return DB::transaction(function () use ($document, $revision): int {
            $page = Page::query()->lockForUpdate()->findOrFail($this->contextInt('page'));

            if ($page->revision !== $revision) {
                throw new StaleRevision($page->revision, $revision);
            }

            $page->forceFill(['draft' => $document, 'revision' => $revision + 1])->save();

            return $page->revision;
        });
    }

    public function publish(BlockDocument $document, int $revision): int
    {
        $page = $this->page();
        $page->forceFill(['published' => $document, 'published_at' => now()])->save();

        return $page->revision;
    }

    public function previewUrl(): string
    {
        return route('pages.public', ['page' => $this->page()->slug], absolute: false);
    }

    public function title(): string
    {
        return $this->page()->title;
    }

    private function page(): Page
    {
        return Page::query()->findOrFail($this->contextInt('page'));
    }

    /**
     * @return array<string, mixed>
     */
    private function paragraph(string $text): array
    {
        return ['type' => 'doc', 'content' => [['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => $text]]]]];
    }
}
