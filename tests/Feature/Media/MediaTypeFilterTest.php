<?php
declare(strict_types=1);

use Lattice\Media\Tables\Filters\MediaTypeFilter;
use Lattice\Table\Filters\SelectFilter;

test('the media type filter serializes its own wire type, distinct from the table select filter', function (): void {
    $filter = wire(MediaTypeFilter::make('type')->label('Type'));

    expect($filter['type'])->toBe('filter.media-type')
        ->and($filter['type'])->not->toBe(wire(SelectFilter::make('status'))['type']);
});
