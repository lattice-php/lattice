<?php
declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Lattice\Lattice\Actions\ActionResult;
use Lattice\Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Lattice\Actions\Components\ActionGroup;
use Lattice\Lattice\Core\Enums\ButtonVariant;
use Lattice\Lattice\Core\Enums\HttpMethod;
use Lattice\Lattice\Core\Enums\Variant;
use Lattice\Lattice\Core\Values\Callout;
use Lattice\Lattice\Core\Values\ToastMessage;
use Lattice\Lattice\Core\Values\Translatable;
use Lattice\Lattice\Effects\Effect;

test('a toast serializes its lifetime, dismissibility and link', function (): void {
    $wire = wire(Effect::toast(
        ToastMessage::make(Variant::Success, 'Saved.')
            ->duration(8000)
            ->dismissible(false)
            ->link('Undo', '/undo', HttpMethod::Patch),
    ));

    expect($wire['type'])->toBe('toast')
        ->and($wire['toast']['duration'])->toBe(8000)
        ->and($wire['toast']['persistent'])->toBeFalse()
        ->and($wire['toast']['dismissible'])->toBeFalse()
        ->and($wire['toast']['action']['type'])->toBe('link')
        ->and($wire['toast']['action']['props']['label'])->toBe('Undo')
        ->and($wire['toast']['action']['props']['href'])->toBe('/undo')
        ->and($wire['toast']['action']['props']['method'])->toBe('patch');
});

test('a toast can carry an action component', function (): void {
    $wire = wire(Effect::toast(
        ToastMessage::make(Variant::Info, 'Done.')
            ->persistent()
            ->action(ActionComponent::make('demo.toast-action')->endpoint('/x')->label('Open')),
    ));

    expect($wire['toast']['persistent'])->toBeTrue()
        ->and($wire['toast']['action']['type'])->toBe('action')
        ->and($wire['toast']['action']['props']['label'])->toBe('Open')
        ->and($wire['toast']['action']['props']['endpoint'])->toBe('/x');
});

test('action results expose the full effect vocabulary', function (): void {
    $result = ActionResult::success()
        ->reloadPage()
        ->to('/dashboard')
        ->download('/exports/report.csv')
        ->resetForm('teams.create')
        ->localeChange('de');

    expect(wire($result)['effects'])->toBe([
        ['type' => 'reload-page'],
        ['type' => 'redirect', 'url' => '/dashboard'],
        ['type' => 'download', 'url' => '/exports/report.csv'],
        ['type' => 'reset-form', 'form' => 'teams.create'],
        ['type' => 'locale-change', 'locale' => 'de'],
    ])
        ->and(wire(Effect::resetForm()))->toBe(['type' => 'reset-form', 'form' => null])
        ->and(wire(Effect::reloadPage()))->toBe(['type' => 'reload-page']);
});

test('action result navigation verbs emit a redirect effect', function (): void {
    Route::get('action-target', fn (): string => 'ok')->name('action-target');

    $to = ActionResult::success()->to('/dashboard');
    $toRoute = ActionResult::success()->toRoute('action-target');
    $back = ActionResult::success()->back();

    expect(wire($to)['effects'])->toBe([['type' => 'redirect', 'url' => '/dashboard']])
        ->and(wire($toRoute)['effects'])->toBe([['type' => 'redirect', 'url' => route('action-target')]])
        ->and(wire($back)['effects'][0]['type'])->toBe('redirect');
});

test('action result toasts accept a translatable message', function (): void {
    $result = ActionResult::success()->toast(Translatable::make('common.action.save'), Variant::Info);

    expect(wire($result)['effects'][0]['type'])->toBe('toast')
        ->and(wire($result)['effects'][0]['toast']['variant'])->toBe('info');
});

test('a callout effect serializes its callout payload', function (): void {
    $wire = wire(Effect::callout(
        Callout::make(Variant::Warning, 'Your trial ends in 3 days.')
            ->title('Trial ending')
            ->link('Upgrade', '/billing'),
    ));

    expect($wire['type'])->toBe('callout')
        ->and($wire['callout']['variant'])->toBe('warning')
        ->and($wire['callout']['title'])->toBe('Trial ending')
        ->and($wire['callout']['message'])->toBe('Your trial ends in 3 days.')
        ->and($wire['callout']['action']['props']['label'])->toBe('Upgrade');
});

test('action results expose the callout effect', function (): void {
    $result = ActionResult::success()->callout(
        Callout::make(Variant::Info, 'Saved as draft.'),
    );

    expect(wire($result)['effects'][0]['type'])->toBe('callout')
        ->and(wire($result)['effects'][0]['callout']['variant'])->toBe('info');
});

test('action groups serialize grouped child actions', function (): void {
    $group = wire(ActionGroup::make('workbench.user-actions')
        ->label('Manage user')
        ->actions([
            ActionComponent::make('workbench.users.promote')
                ->endpoint('/lattice/actions/workbench.users.promote')
                ->label('Promote')
                ->method(HttpMethod::Patch),
            ActionComponent::make('workbench.users.remove')
                ->endpoint('/lattice/actions/workbench.users.remove')
                ->label('Remove')
                ->method(HttpMethod::Delete)
                ->variant(ButtonVariant::Destructive),
        ]));

    expect($group)
        ->toMatchArray([
            'type' => 'action.group',
            'id' => 'workbench.user-actions',
            'props' => [
                'label' => 'Manage user',
                'orientation' => null,
                'ref' => null,
            ],
            'schema' => [
                [
                    'type' => 'action',
                    'id' => 'workbench.users.promote',
                    'props' => [
                        'endpoint' => '/lattice/actions/workbench.users.promote',
                        'label' => 'Promote',
                        'method' => 'patch',
                        'icon' => null,
                        'confirmation' => null,
                        'form' => null,
                        'lazyForm' => false,
                        'variant' => null,
                        'ref' => componentRef($group['schema'][0]),
                    ],
                ],
                [
                    'type' => 'action',
                    'id' => 'workbench.users.remove',
                    'props' => [
                        'endpoint' => '/lattice/actions/workbench.users.remove',
                        'label' => 'Remove',
                        'method' => 'delete',
                        'icon' => null,
                        'confirmation' => null,
                        'form' => null,
                        'lazyForm' => false,
                        'variant' => 'destructive',
                        'ref' => componentRef($group['schema'][1]),
                    ],
                ],
            ],
        ]);
});
