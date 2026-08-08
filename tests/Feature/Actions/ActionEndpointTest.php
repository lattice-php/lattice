<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Core\Facades\Lattice;
use Lattice\Tests\Fixtures\Workbench\WorkbenchFailingAction;
use Lattice\Tests\Fixtures\Workbench\WorkbenchPingAction;
use Workbench\App\Actions\SetLocaleAction;
use Workbench\App\Models\User;

use function Pest\Laravel\postJson;

test('registered actions can be handled through the package endpoint', function (): void {
    Lattice::actions([WorkbenchPingAction::class]);

    $this->callAction(WorkbenchPingAction::class, [
        'name' => 'Taylor',
        'context' => [
            'team' => 'tampered-team',
        ],
    ], ['team' => 'trusted-team'])
        ->assertOk()
        ->assertJsonPath('data.handled', 'Taylor')
        ->assertJsonPath('data.team', 'trusted-team')
        ->assertJsonPath('effects.0.type', 'toast')
        ->assertJsonPath('effects.0.props.message', 'Action handled.')
        ->assertJsonPath('effects.0.props.variant', 'info')
        ->assertJsonPath('effects.1.type', 'reload-component')
        ->assertJsonPath('effects.1.props.component', 'workbench.users');
});

test('registered actions can return a locale change effect', function (): void {
    $ref = $this->latticeRef(wire(ActionComponent::use(SetLocaleAction::class)
        ->context(['locale' => 'de'])));

    postJson('/lattice/actions/workbench.locale.set', [], $this->latticeHeaders($ref))
        ->assertOk()
        ->assertJsonPath('effects.0.type', 'locale-change')
        ->assertJsonPath('effects.0.props.locale', 'de');
});

test('a failure result returns 422 and still serializes its effects', function (): void {
    Lattice::actions([WorkbenchFailingAction::class]);

    $this->callAction(WorkbenchFailingAction::class, [])
        ->assertStatus(422)
        ->assertJsonPath('effects.0.type', 'toast')
        ->assertJsonPath('effects.0.props.variant', 'danger')
        ->assertJsonPath('effects.0.props.message', 'Could not process.');
});

test('registered action endpoints require a valid component reference', function (): void {
    Lattice::actions([WorkbenchPingAction::class]);

    postJson('/lattice/actions/workbench.ping', ['name' => 'Taylor'])
        ->assertForbidden();

    postJson('/lattice/actions/workbench.ping', [
        'name' => 'Taylor',
    ], $this->latticeHeaders('tampered'))
        ->assertForbidden();
});

test('registered action endpoints reject an expired component reference', function (): void {
    Lattice::actions([WorkbenchPingAction::class]);

    $ref = $this->latticeRef(wire(ActionComponent::use(WorkbenchPingAction::class)));

    $this->travel(config('lattice.security.ref_lifetime', 30) + 1)->minutes();

    postJson('/lattice/actions/workbench.ping', ['name' => 'Taylor'], $this->latticeHeaders($ref))
        ->assertForbidden();
});

test('registered action endpoints reject a reference sealed for another user', function (): void {
    Lattice::actions([WorkbenchPingAction::class]);

    $request = Request::create('/');
    app()->instance('request', $request);
    $request->setUserResolver(fn (): User => workbenchTestUser());
    $ref = $this->latticeRef(wire(ActionComponent::use(WorkbenchPingAction::class)));

    $this->actingAs(workbenchTestUser());

    postJson('/lattice/actions/workbench.ping', ['name' => 'Taylor'], $this->latticeHeaders($ref))
        ->assertForbidden();
});
