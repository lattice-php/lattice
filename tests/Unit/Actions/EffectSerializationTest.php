<?php
declare(strict_types=1);

use Lattice\Lattice\Actions\ActionResult;
use Lattice\Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Lattice\Actions\Components\ActionGroup;
use Lattice\Lattice\Core\Enums\ButtonVariant;
use Lattice\Lattice\Core\Enums\HttpMethod;
use Lattice\Lattice\Core\Enums\Variant;
use Lattice\Lattice\Core\Values\Callout;
use Lattice\Lattice\Core\Values\ToastMessage;
use Lattice\Lattice\Effects\Effect;

test('a toast serializes its lifetime, dismissibility and link', function () {
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

test('a toast can carry an action component', function () {
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

test('action results expose the full effect vocabulary', function () {
    $result = ActionResult::success()
        ->reloadPage()
        ->redirect('/dashboard')
        ->download('/exports/report.csv')
        ->resetForm('teams.create')
        ->localeChange('de');

    expect(wire($result)['effects'])->toBe([
        ['type' => 'reloadPage'],
        ['type' => 'redirect', 'url' => '/dashboard'],
        ['type' => 'download', 'url' => '/exports/report.csv'],
        ['type' => 'resetForm', 'form' => 'teams.create'],
        ['type' => 'localeChange', 'locale' => 'de'],
    ])
        ->and(wire(Effect::resetForm()))->toBe(['type' => 'resetForm', 'form' => null])
        ->and(wire(Effect::reloadPage()))->toBe(['type' => 'reloadPage']);
});

test('a callout effect serializes its callout payload', function () {
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

test('action results expose the callout effect', function () {
    $result = ActionResult::success()->callout(
        Callout::make(Variant::Info, 'Saved as draft.'),
    );

    expect(wire($result)['effects'][0]['type'])->toBe('callout')
        ->and(wire($result)['effects'][0]['callout']['variant'])->toBe('info');
});

test('action groups serialize grouped child actions', function () {
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
                        'effects' => [],
                        'form' => null,
                        'lazyForm' => null,
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
                        'effects' => [],
                        'form' => null,
                        'lazyForm' => null,
                        'variant' => 'destructive',
                        'ref' => componentRef($group['schema'][1]),
                    ],
                ],
            ],
        ]);
});
