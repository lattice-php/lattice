<?php
declare(strict_types=1);

namespace Workbench\App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use Lattice\Blocks\BlockDocument;
use Lattice\Blocks\Casts\AsBlockDocument;
use Workbench\App\Factories\PageFactory;

/**
 * @property string $title
 * @property string $slug
 * @property BlockDocument|null $draft
 * @property BlockDocument|null $published
 * @property int $revision
 * @property Carbon|null $published_at
 */
class Page extends Model
{
    /** @use HasFactory<PageFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = ['title', 'slug', 'draft', 'published', 'revision', 'published_at'];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'draft' => AsBlockDocument::class,
            'published' => AsBlockDocument::class,
            'revision' => 'integer',
            'published_at' => 'datetime',
        ];
    }

    protected static function newFactory(): PageFactory
    {
        return PageFactory::new();
    }
}
