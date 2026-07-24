<?php
declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Lattice\Lattice\Actions\ActionResult;
use Lattice\Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Lattice\Actions\Components\ActionGroup;
use Lattice\Lattice\Effects\Builtin\Callout;
use Lattice\Lattice\Effects\Builtin\Toast;
use Lattice\Lattice\Facades\Effects;
use Lattice\Lattice\I18n\Values\Translatable;
use Lattice\Lattice\Ui\Enums\HttpMethod;
use Lattice\Lattice\Ui\Enums\Intent;
use Lattice\Lattice\Ui\Enums\Variant;

test('a toast serializes its lifetime, dismissibility and link', function (): void {
    $wire = wire(Effects::toast(
        Toast::make('Saved.', Variant::Success)
            ->duration(8000)
            ->dismissible(false)
            ->link('Undo', '/undo', HttpMethod::Patch),
    ));

    expect($wire['type'])->toBe('toast')
        ->and($wire['props']['duration'])->toBe(8000)
        ->and($wire['props']['persistent'])->toBeFalse()
        ->and($wire['props']['dismissible'])->toBeFalse()
        ->and($wire['props']['action']['type'])->toBe('link')
        ->and($wire['props']['action']['props']['label'])->toBe('Undo')
        ->and($wire['props']['action']['props']['href'])->toBe('/undo')
        ->and($wire['props']['action']['props']['method'])->toBe('patch');
});

test('a toast can carry an action component', function (): void {
    $wire = wire(Effects::toast(
        Toast::make('Done.', Variant::Info)
            ->persistent()
            ->action(ActionComponent::make('demo.toast-action')->endpoint('/x')->label('Open')),
    ));

    expect($wire['props']['persistent'])->toBeTrue()
        ->and($wire['props']['action']['type'])->toBe('action')
        ->and($wire['props']['action']['props']['label'])->toBe('Open')
        ->and($wire['props']['action']['props']['endpoint'])->toBe('/x');
});

test('action results expose the full effect vocabulary', function (): void {
    $result = ActionResult::success()
        ->reloadPage()
        ->to('/dashboard')
        ->download('/exports/report.csv')
        ->resetForm('teams.create')
        ->localeChange('de');

    expect(wire($result)['effects'])->toBe([
        ['type' => 'reload-page', 'props' => []],
        ['type' => 'redirect', 'props' => ['url' => '/dashboard']],
        ['type' => 'download', 'props' => ['url' => '/exports/report.csv']],
        ['type' => 'reset-form', 'props' => ['form' => 'teams.create']],
        ['type' => 'locale-change', 'props' => ['locale' => 'de']],
    ])
        ->and(wire(Effects::resetForm()))->toBe(['type' => 'reset-form', 'props' => ['form' => null]])
        ->and(wire(Effects::reloadPage()))->toBe(['type' => 'reload-page', 'props' => []]);
});

test('action result navigation verbs emit a redirect effect', function (): void {
    Route::get('action-target', fn (): string => 'ok')->name('action-target');

    $to = ActionResult::success()->to('/dashboard');
    $toRoute = ActionResult::success()->toRoute('action-target');
    $back = ActionResult::success()->back();

    expect(wire($to)['effects'])->toBe([['type' => 'redirect', 'props' => ['url' => '/dashboard']]])
        ->and(wire($toRoute)['effects'])->toBe([['type' => 'redirect', 'props' => ['url' => route('action-target')]]])
        ->and(wire($back)['effects'][0]['type'])->toBe('redirect');
});

test('action result toasts accept a translatable message', function (): void {
    $result = ActionResult::success()->toast(Translatable::make('common.action.save'), Variant::Info);

    expect(wire($result)['effects'][0]['type'])->toBe('toast')
        ->and(wire($result)['effects'][0]['props']['variant'])->toBe('info');
});

test('a callout effect serializes its callout payload', function (): void {
    $wire = wire(
        Callout::make('Your trial ends in 3 days.', Variant::Warning)
            ->title('Trial ending')
            ->link('Upgrade', '/billing'),
    );

    expect($wire['type'])->toBe('callout')
        ->and($wire['props']['variant'])->toBe('warning')
        ->and($wire['props']['title'])->toBe('Trial ending')
        ->and($wire['props']['message'])->toBe('Your trial ends in 3 days.')
        ->and($wire['props']['action']['props']['label'])->toBe('Upgrade');
});

test('a callout accepts a translatable message and title', function (): void {
    $wire = wire(
        Callout::make(Translatable::make('billing.trial-ending.body')->with(['days' => 3]), Variant::Warning)
            ->title(Translatable::make('billing.trial-ending.title')),
    );

    expect($wire['props']['message'])->toBe([
        'key' => 'billing.trial-ending.body',
        'payload' => [],
        'replacements' => ['days' => 3],
    ])
        ->and($wire['props']['title']['key'])->toBe('billing.trial-ending.title');
});

test('action results expose the callout effect', function (): void {
    $result = ActionResult::success()->callout(
        Callout::make('Saved as draft.', Variant::Info),
    );

    expect(wire($result)['effects'][0]['type'])->toBe('callout')
        ->and(wire($result)['effects'][0]['props']['variant'])->toBe('info');
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
                ->color(Intent::Danger),
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
                        'modalSide' => null,
                        'modalWidth' => null,
                        'variant' => null,
                        'color' => null,
                        'ref' => $this->latticeRef($group['schema'][0]),
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
                        'modalSide' => null,
                        'modalWidth' => null,
                        'variant' => null,
                        'color' => 'danger',
                        'ref' => $this->latticeRef($group['schema'][1]),
                    ],
                ],
            ],
        ]);
});
