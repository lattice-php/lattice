<?php
declare(strict_types=1);

namespace Workbench\App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Model;

/**
 * @property string $id
 * @property string $resource_id
 * @property string $label
 * @property CarbonImmutable $starts_on
 * @property CarbonImmutable $ends_on
 * @property string|null $color
 */
final class ProjectPlanAssignment extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    /** @var list<string> */
    protected $fillable = [
        'id',
        'resource_id',
        'label',
        'starts_on',
        'ends_on',
        'color',
    ];

    /** @return array<string, string> */
    #[\Override]
    protected function casts(): array
    {
        return [
            'starts_on' => 'immutable_date',
            'ends_on' => 'immutable_date',
        ];
    }
}
