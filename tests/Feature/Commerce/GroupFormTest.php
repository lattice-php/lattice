<?php
declare(strict_types=1);

use Lattice\Lattice\Facades\Lattice;
use Workbench\App\Forms\GroupForm;
use Workbench\App\Models\Group;

use function Pest\Laravel\get;
use function Pest\Laravel\withoutVite;

test('the group create page renders', function (): void {
    withoutVite();
    $this->actingAs(workbenchTestUser());

    get('/groups/create')->assertOk();
});

test('the group form creates a group and redirects', function (): void {
    Lattice::forms([GroupForm::class]);

    $this->submitForm(GroupForm::class, [
        'name' => 'Premium Customers',
    ])
        ->assertRedirect('/groups');

    expect(Group::query()->where('name', 'Premium Customers')->exists())->toBeTrue();
});

test('the group edit page renders with prefilled form state', function (): void {
    $group = Group::factory()->create(['name' => 'VIP Partners']);

    withoutVite();
    $this->actingAs(workbenchTestUser());

    $this->assertLatticePage(get("/groups/{$group->getKey()}/edit")->assertOk())
        ->form(tap: fn ($form) => $form
            ->field('name', fn ($name) => $name->assertInitialValue('VIP Partners')));
});

test('the group form updates an existing group', function (): void {
    Lattice::forms([GroupForm::class]);

    $group = Group::factory()->create(['name' => 'Old Name']);

    $this->submitForm(GroupForm::class, [
        'name' => 'New Name',
    ], ['group_id' => $group->getKey()])
        ->assertRedirect('/groups');

    expect($group->fresh()->name)->toBe('New Name');
});
