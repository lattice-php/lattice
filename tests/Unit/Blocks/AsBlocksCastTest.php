<?php
declare(strict_types=1);

use Illuminate\Database\Eloquent\Model;
use Lattice\Lattice\Blocks\Casts\AsBlocks;

test('decodes stored json into a list of rows', function (): void {
    $cast = new AsBlocks;
    $model = new class extends Model {};

    $rows = $cast->get($model, 'content', '[{"type":"hero","title":"Hi"}]', []);

    expect($rows)->toBe([['type' => 'hero', 'title' => 'Hi']]);
});

test('returns an empty list for null', function (): void {
    $cast = new AsBlocks;
    $model = new class extends Model {};

    expect($cast->get($model, 'content', null, []))->toBe([]);
});

test('encodes a list of rows to json for storage', function (): void {
    $cast = new AsBlocks;
    $model = new class extends Model {};

    $stored = $cast->set($model, 'content', [['type' => 'hero', 'title' => 'Hi']], []);

    expect($stored)->toBe(['content' => '[{"type":"hero","title":"Hi"}]']);
});
