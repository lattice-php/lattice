<?php
declare(strict_types=1);

namespace Lattice\Blocks;

use Lattice\Blocks\Exceptions\StaleRevision;
use Lattice\Core\Definition;

/**
 * The persistence seam of one editable block document: which blocks it
 * offers, where the draft lives, and how a draft becomes the published state.
 * The sealed context (a page id, a locale) re-applies on every endpoint call.
 */
abstract class BlockEditorDefinition extends Definition
{
    /**
     * The block definitions this editor offers; an empty list offers every
     * discovered block.
     *
     * @return list<class-string<BlockDefinition>>
     */
    public function blocks(): array
    {
        return [];
    }

    abstract public function load(): BlockDocument;

    abstract public function revision(): int;

    /**
     * Persist the draft and return the new revision. Implementations compare
     * `$revision` with the stored one and throw {@see StaleRevision} when the
     * editor worked from an outdated draft.
     */
    abstract public function saveDraft(BlockDocument $document, int $revision): int;

    /**
     * Promote the given (already validated) document to the published state
     * and return the new revision.
     */
    abstract public function publish(BlockDocument $document, int $revision): int;

    public function previewUrl(): ?string
    {
        return null;
    }

    public function title(): ?string
    {
        return null;
    }
}
