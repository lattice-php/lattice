<?php
declare(strict_types=1);

use Illuminate\Http\UploadedFile;
use Lattice\Media\Actions\CreateMediaFolderAction;
use Lattice\Media\Actions\DeleteMediaFolderAction;
use Lattice\Media\Actions\MoveMediaFolderAction;
use Lattice\Media\Actions\MoveSelectedMediaAction;
use Lattice\Media\Actions\UpdateMediaFolderAction;
use Lattice\Media\Actions\UploadMediaAction;
use Lattice\Media\Models\Media;
use Lattice\Media\Models\MediaFolder;
use Lattice\Media\Tables\MediaTable;
use Lattice\Media\Trees\MediaFolderTree;
use Lattice\Tree\Tree;

beforeEach(function (): void {
    bootstrapMediaTest(
        tables: [MediaTable::class],
        actions: [
            CreateMediaFolderAction::class,
            UpdateMediaFolderAction::class,
            DeleteMediaFolderAction::class,
            MoveMediaFolderAction::class,
            UploadMediaAction::class,
        ],
        bulkActions: [MoveSelectedMediaAction::class],
    );
});

test('a folder is created at the root and numbered after its siblings', function (): void {
    MediaFolder::factory()->create(['name' => 'Invoices', 'sort_order' => 3]);

    $this->callAction(CreateMediaFolderAction::class, ['name' => 'Photos'])->assertOk();

    $folder = MediaFolder::query()->where('name', 'Photos')->firstOrFail();

    expect($folder->parent_id)->toBeNull()
        ->and($folder->sort_order)->toBe(4);
});

test('a sealed folder context creates a subfolder of that node', function (): void {
    $parent = MediaFolder::factory()->create(['name' => 'Invoices']);

    $this->callAction(
        CreateMediaFolderAction::class,
        ['name' => '2026'],
        ['folder' => $parent->getKey()],
    )->assertOk();

    expect(MediaFolder::query()->where('name', '2026')->value('parent_id'))->toBe($parent->getKey());
});

test('a folder is renamed', function (): void {
    $folder = MediaFolder::factory()->create(['name' => 'Invoces']);

    $this->callAction(
        UpdateMediaFolderAction::class,
        ['name' => 'Invoices'],
        ['folder' => $folder->getKey()],
    )->assertOk();

    expect($folder->refresh()->name)->toBe('Invoices');
});

test('deleting a folder moves its subfolders and files to the parent instead of deleting them', function (): void {
    $root = MediaFolder::factory()->create(['name' => 'Archive']);
    $year = MediaFolder::factory()->create(['name' => '2026', 'parent_id' => $root->getKey()]);
    $month = MediaFolder::factory()->create(['name' => 'January', 'parent_id' => $year->getKey()]);
    $media = Media::factory()->create(['folder_id' => $year->getKey()]);

    $this->callAction(DeleteMediaFolderAction::class, [], ['folder' => $year->getKey()])->assertOk();

    expect(MediaFolder::query()->find($year->getKey()))->toBeNull()
        ->and($month->refresh()->parent_id)->toBe($root->getKey())
        ->and($media->refresh()->folder_id)->toBe($root->getKey());
});

test('deleting a root folder detaches its files without deleting them', function (): void {
    $folder = MediaFolder::factory()->create();
    $media = Media::factory()->create(['folder_id' => $folder->getKey()]);

    $this->callAction(DeleteMediaFolderAction::class, [], ['folder' => $folder->getKey()])->assertOk();

    expect($media->refresh()->folder_id)->toBeNull()
        ->and(Media::query()->count())->toBe(1);
});

test('a folder moves into another parent and takes a contiguous position', function (): void {
    $invoices = MediaFolder::factory()->create(['name' => 'Invoices', 'sort_order' => 0]);
    $photos = MediaFolder::factory()->create(['name' => 'Photos', 'sort_order' => 1]);

    $this->callAction(MoveMediaFolderAction::class, [
        'nodeId' => $photos->getKey(),
        'parentId' => $invoices->getKey(),
        'position' => 0,
    ])->assertOk();

    expect($photos->refresh()->parent_id)->toBe($invoices->getKey())
        ->and($photos->sort_order)->toBe(0);
});

test('a folder cannot be moved inside its own subtree', function (): void {
    $parent = MediaFolder::factory()->create();
    $child = MediaFolder::factory()->create(['parent_id' => $parent->getKey()]);

    $this->callAction(MoveMediaFolderAction::class, [
        'nodeId' => $parent->getKey(),
        'parentId' => $child->getKey(),
        'position' => 0,
    ])->assertUnprocessable();

    expect($parent->refresh()->parent_id)->toBeNull();
});

test('the folder filter narrows the listing, including the files in no folder at all', function (): void {
    $folder = MediaFolder::factory()->create();
    Media::factory()->create(['name' => 'filed.jpg', 'folder_id' => $folder->getKey()]);
    Media::factory()->create(['name' => 'loose.jpg']);

    $all = $this->loadTable(MediaTable::class)->assertOk()->json('data');
    expect($all)->toHaveCount(2);

    $filed = $this->loadTable(MediaTable::class, ['tf' => ['folder' => ['value' => (string) $folder->getKey()]]])
        ->assertOk()
        ->json('data');

    expect(array_column($filed, 'name'))->toBe(['filed.jpg']);

    $loose = $this->loadTable(MediaTable::class, ['tf' => ['folder' => ['value' => 'unassigned']]])
        ->assertOk()
        ->json('data');

    expect(array_column($loose, 'name'))->toBe(['loose.jpg']);
});

test('the bulk action files the selection into a folder and back out of it', function (): void {
    $folder = MediaFolder::factory()->create();
    $first = Media::factory()->create();
    $second = Media::factory()->create();
    $untouched = Media::factory()->create();

    $this->callBulkAction(MoveSelectedMediaAction::class, [
        'selected' => [$first->getKey(), $second->getKey()],
        'folder_id' => $folder->getKey(),
    ], ['table' => 'media.library'])->assertOk();

    expect($first->refresh()->folder_id)->toBe($folder->getKey())
        ->and($second->refresh()->folder_id)->toBe($folder->getKey())
        ->and($untouched->refresh()->folder_id)->toBeNull();

    $this->callBulkAction(MoveSelectedMediaAction::class, [
        'selected' => [$first->getKey()],
        'folder_id' => null,
    ], ['table' => 'media.library'])->assertOk();

    expect($first->refresh()->folder_id)->toBeNull();
});

test('a folder that does not exist is rejected as a move target', function (): void {
    $media = Media::factory()->create();

    $this->callBulkAction(MoveSelectedMediaAction::class, [
        'selected' => [$media->getKey()],
        'folder_id' => 9999,
    ], ['table' => 'media.library'])->assertUnprocessable();
});

test('an upload is filed into the folder the client posted', function (): void {
    $folder = MediaFolder::factory()->create();

    $this->callAction(UploadMediaAction::class, [
        'files' => [UploadedFile::fake()->image('shot.jpg')],
        'folder_id' => $folder->getKey(),
    ])->assertOk();

    expect(Media::query()->value('folder_id'))->toBe($folder->getKey());
});

test('an upload into a folder that does not exist is rejected', function (): void {
    $this->callAction(UploadMediaAction::class, [
        'files' => [UploadedFile::fake()->image('shot.jpg')],
        'folder_id' => 9999,
    ])->assertUnprocessable();

    expect(Media::query()->count())->toBe(0);
});

test('the folder tree serializes the hierarchy with file counts and per-node actions', function (): void {
    $invoices = MediaFolder::factory()->create(['name' => 'Invoices']);
    MediaFolder::factory()->create(['name' => '2026', 'parent_id' => $invoices->getKey()]);
    Media::factory()->create(['folder_id' => $invoices->getKey()]);

    $tree = $this->sealTree(fn (): Tree => Tree::use(MediaFolderTree::class));
    $root = $tree['props']['nodes'][0];

    expect($root['label'])->toBe('Invoices')
        ->and($root['children'][0]['label'])->toBe('2026');

    $badges = array_column(array_column($root['schema'], 'props'), 'label');
    expect($badges)->toContain('1');
});
