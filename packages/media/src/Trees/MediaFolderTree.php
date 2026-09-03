<?php
declare(strict_types=1);

namespace Lattice\Media\Trees;

use Lattice\Actions\Components\Action;
use Lattice\Actions\Components\ActionGroup;
use Lattice\Media\Actions\CreateMediaFolderAction;
use Lattice\Media\Actions\DeleteMediaFolderAction;
use Lattice\Media\Actions\UpdateMediaFolderAction;
use Lattice\Media\Models\MediaFolder;
use Lattice\Tree\AsTree;
use Lattice\Tree\EloquentTreeSource;
use Lattice\Tree\TreeDefinition;
use Lattice\Tree\TreeNode;
use Lattice\Tree\TreeSource;

/**
 * The media library's folder rail. One global tree: the library's `category`
 * scope narrows the files it lists, never the folders it offers.
 */
#[AsTree('media.folders')]
final class MediaFolderTree extends TreeDefinition
{
    public function source(): TreeSource
    {
        return EloquentTreeSource::make(MediaFolder::class)
            ->scope(fn ($query) => $query->withCount('media'))
            ->orderBy('sort_order')
            ->map(fn (MediaFolder $folder, TreeNode $node): TreeNode => $node
                ->icon('folder')
                ->badge((string) ($folder->media_count ?? 0))
                ->actions($this->folderActions((int) $folder->getKey())));
    }

    private function folderActions(int $folder): ActionGroup
    {
        return ActionGroup::make("media-folder-{$folder}")->actions([
            Action::use(CreateMediaFolderAction::class, ['folder' => $folder])
                ->label(__('media::media.folders.create.child-label')),
            Action::use(UpdateMediaFolderAction::class, ['folder' => $folder]),
            Action::use(DeleteMediaFolderAction::class, ['folder' => $folder]),
        ]);
    }
}
