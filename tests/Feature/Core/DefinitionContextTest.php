<?php
declare(strict_types=1);

use Lattice\Core\Facades\Lattice;
use Lattice\Tests\Fixtures\Workbench\WorkbenchContextAction;

beforeEach(function (): void {
    Lattice::actions([WorkbenchContextAction::class]);
});

test('typed accessors read sealed context and resolve dot paths', function (): void {
    $this->callAction(WorkbenchContextAction::class, [], [
        'project' => 'acme',
        'role' => '7',
        'team' => ['slug' => 'core'],
    ])
        ->assertOk()
        ->assertJsonPath('data.project', 'acme')
        ->assertJsonPath('data.role', 7)
        ->assertJsonPath('data.nested', 'core')
        ->assertJsonPath('data.missingString', null)
        ->assertJsonPath('data.missingInt', null);
});

test('a strict string accessor aborts when the key is absent', function (): void {
    $this->callAction(WorkbenchContextAction::class, [], ['role' => 7])
        ->assertNotFound();
});

test('a strict string accessor aborts on an empty string', function (): void {
    $this->callAction(WorkbenchContextAction::class, [], ['project' => '', 'role' => 7])
        ->assertNotFound();
});

test('the string accessor is strict about type rather than coercive', function (): void {
    $this->callAction(WorkbenchContextAction::class, [], ['project' => 5, 'role' => 7])
        ->assertNotFound();
});

test('a strict int accessor aborts on a non-numeric value', function (): void {
    $this->callAction(WorkbenchContextAction::class, [], ['project' => 'acme', 'role' => 'seven'])
        ->assertNotFound();
});
