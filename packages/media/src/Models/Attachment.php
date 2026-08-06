<?php
declare(strict_types=1);

namespace Lattice\Media\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphPivot;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property array<string, mixed>|null $meta
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
final class Attachment extends MorphPivot
{
    protected $table = 'media_attachments';

    public $incrementing = true;

    /**
     * @return BelongsTo<Media, $this>
     */
    public function media(): BelongsTo
    {
        return $this->belongsTo(Media::modelClass(), 'media_id');
    }

    /**
     * @return array<string, string>
     */
    #[\Override]
    protected function casts(): array
    {
        return ['meta' => 'array'];
    }
}
