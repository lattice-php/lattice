<?php
declare(strict_types=1);

namespace Workbench\App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Illuminate\Support\Facades\Storage;
use Workbench\App\Factories\FileFactory;

/**
 * @property string $disk
 * @property string $path
 * @property string $name
 * @property string|null $mime_type
 * @property int|null $size
 * @property-read Collection<int, Product> $products
 */
class File extends Model
{
    /** @use HasFactory<FileFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = ['disk', 'path', 'name', 'mime_type', 'size'];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'size' => 'integer',
        ];
    }

    /** @return MorphToMany<Product, $this> */
    public function products(): MorphToMany
    {
        return $this->morphedByMany(Product::class, 'attachable', 'attachments')
            ->withPivot('sort_order')
            ->withTimestamps();
    }

    public function url(): string
    {
        $disk = Storage::disk($this->disk);

        try {
            return $disk->temporaryUrl($this->path, now()->addMinutes((int) config('lattice.files.url_ttl', 5)));
        } catch (\Throwable) {
            return $disk->url($this->path);
        }
    }

    protected static function newFactory(): FileFactory
    {
        return FileFactory::new();
    }
}
