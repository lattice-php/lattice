<?php
declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Inertia\ResponseFactory;
use Inertia\Support\SessionKey;
use Lattice\Lattice\Actions\ActionResult;
use Lattice\Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Lattice\Actions\Effect;
use Lattice\Lattice\Core\Concerns\CreatesToastMessages;
use Lattice\Lattice\Core\Enums\ToastVariant;
use Lattice\Lattice\Core\Values\ToastMessage;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Tests\Fixtures\Workbench\WorkbenchPingAction;

use function Pest\Laravel\postJson;

test('registered actions serialize their configured endpoint method label and effects', function () {
    config(['lattice.actions.endpoint' => 'custom/actions/{action}']);

    Lattice::actions([WorkbenchPingAction::class]);

    $action = wire(ActionComponent::use(WorkbenchPingAction::class));

    expect($action)
        ->toMatchArray([
            'type' => 'action',
            'id' => 'workbench.ping',
            'props' => [
                'endpoint' => '/custom/actions/workbench.ping',
                'label' => 'Ping',
                'method' => 'post',
                'ref' => componentRef($action),
                'variant' => 'secondary',
                'icon' => null,
                'confirmation' => null,
                'form' => null,
                'lazyForm' => null,
                'effects' => [
                    [
                        'type' => 'toast',
                        'toast' => [
                            'variant' => 'success',
                            'message' => 'Ready.',
                            'duration' => null,
                            'persistent' => false,
                            'dismissible' => true,
                            'action' => null,
                        ],
                    ],
                    [
                        'type' => 'reloadComponent',
                        'component' => 'workbench.users',
                    ],
                ],
            ],
        ]);
});

test('registered actions can be handled through the package endpoint', function () {
    Lattice::actions([WorkbenchPingAction::class]);

    $ref = componentRef(wire(ActionComponent::use(WorkbenchPingAction::class)
        ->context(['team' => 'trusted-team'])));

    postJson('/lattice/actions/workbench.ping', [
        'name' => 'Taylor',
        'context' => [
            'team' => 'tampered-team',
        ],
    ], latticeHeaders($ref))
        ->assertOk()
        ->assertJsonPath('ok', true)
        ->assertJsonPath('data.handled', 'Taylor')
        ->assertJsonPath('data.team', 'trusted-team')
        ->assertJsonPath('effects.0.type', 'toast')
        ->assertJsonPath('effects.0.toast.message', 'Action handled.')
        ->assertJsonPath('effects.0.toast.variant', 'info')
        ->assertJsonPath('effects.1.type', 'reloadComponent')
        ->assertJsonPath('effects.1.component', 'workbench.users');
});

test('toast messages serialize for flash data and action effects', function () {
    Route::get('toast-target', fn () => 'ok')->name('toast.target');

    $response = WorkbenchToastFactory::flashToast(ToastVariant::Warning, 'Review the settings.')
        ->toRoute('toast.target');
    $flashedToast = session()->get(SessionKey::FLASH_DATA, [])['toast'] ?? null;

    expect($response->getTargetUrl())
        ->toBe(route('toast.target'))
        ->and($flashedToast)
        ->toBeInstanceOf(ToastMessage::class);

    assert($flashedToast instanceof ToastMessage);

    expect(wire($flashedToast))
        ->toBe([
            'variant' => 'warning',
            'message' => 'Review the settings.',
            'duration' => null,
            'persistent' => false,
            'dismissible' => true,
            'action' => null,
        ])
        ->and(wire(Effect::toast(ToastVariant::Warning, 'Review the settings.')))
        ->toBe([
            'type' => 'toast',
            'toast' => [
                'variant' => 'warning',
                'message' => 'Review the settings.',
                'duration' => null,
                'persistent' => false,
                'dismissible' => true,
                'action' => null,
            ],
        ])
        ->and(wire(ActionResult::success()->toast('Saved.')))
        ->toMatchArray([
            'effects' => [
                [
                    'type' => 'toast',
                    'toast' => [
                        'variant' => 'success',
                        'message' => 'Saved.',
                        'duration' => null,
                        'persistent' => false,
                        'dismissible' => true,
                        'action' => null,
                    ],
                ],
            ],
        ])
        ->and(wire(ActionResult::success()->toast(ToastVariant::Warning, 'Review the settings.')))
        ->toMatchArray([
            'effects' => [
                [
                    'type' => 'toast',
                    'toast' => [
                        'variant' => 'warning',
                        'message' => 'Review the settings.',
                        'duration' => null,
                        'persistent' => false,
                        'dismissible' => true,
                        'action' => null,
                    ],
                ],
            ],
        ]);
});

test('registered action endpoints require a valid component reference', function () {
    Lattice::actions([WorkbenchPingAction::class]);

    postJson('/lattice/actions/workbench.ping', ['name' => 'Taylor'])
        ->assertForbidden();

    postJson('/lattice/actions/workbench.ping', [
        'name' => 'Taylor',
    ], latticeHeaders('tampered'))
        ->assertForbidden();
});

// ---------------------------------------------------------------------------
// Inline fixture class required only by this file
// ---------------------------------------------------------------------------

final class WorkbenchToastFactory
{
    use CreatesToastMessages;

    public static function flashToast(ToastVariant $variant, string $message): ResponseFactory
    {
        return (new self)->toast($variant, $message);
    }
}
