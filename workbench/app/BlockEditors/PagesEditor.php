<?php
declare(strict_types=1);

namespace Workbench\App\BlockEditors;

use Illuminate\Support\Facades\DB;
use Lattice\Blocks\Attributes\AsBlockEditor;
use Lattice\Blocks\BlockDocument;
use Lattice\Blocks\BlockEditorDefinition;
use Lattice\Blocks\Builtin\Builtin;
use Lattice\Blocks\Exceptions\StaleRevision;
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
        return '/pages/'.$this->page()->getKey();
    }

    public function title(): string
    {
        return $this->page()->title;
    }

    private function page(): Page
    {
        return Page::query()->findOrFail($this->contextInt('page'));
    }
}
