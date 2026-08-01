<?php
declare(strict_types=1);

namespace Workbench\App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Workbench\App\Factories\NoteFactory;

/**
 * @property string $notable_type
 * @property int $notable_id
 * @property string $type
 * @property string $body
 */
class Note extends Model
{
    /** @use HasFactory<NoteFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = ['notable_type', 'notable_id', 'type', 'body'];

    /** @return MorphTo<Model, $this> */
    public function notable(): MorphTo
    {
        return $this->morphTo();
    }

    protected static function newFactory(): NoteFactory
    {
        return NoteFactory::new();
    }
}
