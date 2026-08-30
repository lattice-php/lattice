<?php
declare(strict_types=1);

namespace Workbench\App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Workbench\App\Factories\TaskFactory;

/**
 * @property string $title
 * @property string $status
 * @property int $position
 * @property string|null $assignee
 */
class Task extends Model
{
    /** @use HasFactory<TaskFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = ['title', 'status', 'position', 'assignee'];

    protected static function newFactory(): TaskFactory
    {
        return TaskFactory::new();
    }
}
