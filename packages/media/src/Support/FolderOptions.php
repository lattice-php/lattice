<?php
declare(strict_types=1);

namespace Lattice\Media\Support;

use Lattice\Core\Option;
use Lattice\Media\Models\MediaFolder;

/**
 * The folder tree flattened into select options, indented by depth so the
 * hierarchy survives a plain listbox.
 */
final class FolderOptions
{
    private const string INDENT = '— ';

    private function __construct() {}

    /**
     * @return list<Option>
     */
    public static function all(): array
    {
        $byParent = MediaFolder::query()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->groupBy(fn (MediaFolder $folder): string => (string) $folder->parent_id);

        $options = [];

        $walk = function (string $parent, int $depth) use (&$walk, $byParent, &$options): void {
            foreach ($byParent->get($parent, collect()) as $folder) {
                $options[] = new Option(
                    str_repeat(self::INDENT, $depth).$folder->name,
                    (string) $folder->getKey(),
                );

                $walk((string) $folder->getKey(), $depth + 1);
            }
        };

        $walk('', 0);

        return $options;
    }
}
