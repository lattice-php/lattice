<?php
declare(strict_types=1);

use Inertia\Testing\AssertableInertia;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Forms\Components\Form;
use Workbench\App\Forms\GroupForm;
use Workbench\App\Models\Group;

use function Pest\Laravel\get;
use function Pest\Laravel\patch;
use function Pest\Laravel\post;
use function Pest\Laravel\withoutVite;

test('the group create page renders', function () {
    withoutVite();
    $this->actingAs(workbenchTestUser());

    get('/groups/create')->assertOk();
});

test('the group form creates a group and redirects', function () {
    Lattice::forms([GroupForm::class]);

    $form = wire(Form::use(GroupForm::class));

    post('/lattice/forms/workbench.groups.form', [
        'name' => 'Premium Customers',
    ], ['X-Lattice-Ref' => componentRef($form)])
        ->assertRedirect('/groups');

    expect(Group::query()->where('name', 'Premium Customers')->exists())->toBeTrue();
});

test('the group edit page renders with prefilled form state', function () {
    $group = Group::factory()->create(['name' => 'VIP Partners']);

    withoutVite();
    $this->actingAs(workbenchTestUser());

    get("/groups/{$group->getKey()}/edit")
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('lattice/page', false)
            ->where('lattice.schema.0.schema.1.props.state.name', 'VIP Partners')
        );
});

test('the group form updates an existing group', function () {
    Lattice::forms([GroupForm::class]);

    $group = Group::factory()->create(['name' => 'Old Name']);

    $form = wire(Form::use(GroupForm::class)
        ->context(['group_id' => $group->getKey()]));

    patch('/lattice/forms/workbench.groups.form', [
        'name' => 'New Name',
    ], ['X-Lattice-Ref' => componentRef($form)])
        ->assertRedirect('/groups');

    expect($group->fresh()->name)->toBe('New Name');
});
