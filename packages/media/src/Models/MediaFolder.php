<?php
declare(strict_types=1);

namespace Lattice\Media\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Lattice\Media\Database\Factories\MediaFolderFactory;

/**
 * A user-managed folder in the media library. Folders are metadata only: they
 * group media rows for browsing and never move stored files, so renaming or
 * re-parenting a folder touches no disk and no conversion.
 *
 * @property int $id
 * @property int|null $parent_id
 * @property string $name
 * @property int $sort_order
 * @property-read int|null $media_count
 */
class MediaFolder extends Model
{
    /** @use HasFactory<MediaFolderFactory> */
    use HasFactory;

    protected $table = 'media_folders';

    protected $guarded = [];

    /**
     * @return BelongsTo<self, $this>
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    /**
     * @return HasMany<self, $this>
     */
    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    /**
     * @return HasMany<Media, $this>
     */
    public function media(): HasMany
    {
        return $this->hasMany(Media::modelClass(), 'folder_id');
    }

    protected static function newFactory(): MediaFolderFactory
    {
        return MediaFolderFactory::new();
    }
}
