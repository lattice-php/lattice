<?php
declare(strict_types=1);

namespace Workbench\App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Workbench\App\Factories\TagFactory;

/**
 * @property string $name
 * @property string $slug
 * @property string $color
 */
class Tag extends Model
{
    /** @use HasFactory<TagFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = [
        'name',
        'slug',
        'color',
    ];

    protected static function newFactory(): TagFactory
    {
        return TagFactory::new();
    }
}
