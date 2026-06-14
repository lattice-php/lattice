<?php
declare(strict_types=1);

use Lattice\Lattice\Actions\Components\Action;
use Lattice\Lattice\Actions\Components\ActionGroup;
use Lattice\Lattice\Actions\Components\BulkAction;
use Lattice\Lattice\Effects\Effect;
use Lattice\Lattice\Core\Enums\ButtonVariant;
use Lattice\Lattice\Core\Enums\HttpMethod;
use Lattice\Lattice\Core\Enums\Icon;
use Lattice\Lattice\Core\Enums\Orientation;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Forms\Components\Textarea;
use Workbench\App\Actions\ArchiveProductAction;
use Workbench\App\Actions\ArchiveSelectedProductsAction;

it('serializes the action wire shape', function (): void {
    $action = Action::make('archive')
        ->endpoint('/lattice/actions/archive')
        ->label('Archive')
        ->method(HttpMethod::Patch)
        ->icon(Icon::Send)
        ->variant(ButtonVariant::Destructive)
        ->confirm('Archive product?', 'This hides the product.', 'Archive', 'Keep')
        ->effects([Effect::reloadComponent('table'), Effect::reloadPage()]);

    $payload = wire($action);

    expect($payload['type'])->toBe('action');
    expect($payload['id'])->toBe('archive');
    expect($payload['props'])->toMatchArray([
        'endpoint' => '/lattice/actions/archive',
        'label' => 'Archive',
        'method' => 'patch',
        'icon' => 'send',
        'variant' => 'destructive',
        'confirmation' => [
            'title' => 'Archive product?',
            'description' => 'This hides the product.',
            'confirmLabel' => 'Archive',
            'cancelLabel' => 'Keep',
        ],
        'effects' => [
            ['type' => 'reloadComponent', 'component' => 'table'],
            ['type' => 'reloadPage'],
        ],
    ]);
    expect($payload['props']['ref'])->toBeString();
    expect($payload['props'])->not->toHaveKey('context');
});

it('accepts arbitrary string icons', function (): void {
    $action = Action::make('custom')
        ->icon('custom.spark')
        ->method(HttpMethod::Delete);

    $payload = wire($action);

    expect($payload['props']['icon'])->toBe('custom.spark');
    expect($payload['props']['method'])->toBe('delete');
});

it('serializes an embedded form schema', function (): void {
    $action = Action::make('reject')
        ->label('Reject')
        ->form([
            Textarea::make('reason', 'Reason')->required(),
        ]);

    $payload = wire($action);

    expect($payload['props']['form']['type'])->toBe('form');
    expect($payload['props']['form']['schema'])->toHaveCount(1);
    expect($payload['props']['form']['schema'][0]['type'])->toBe('form.textarea');
    expect($payload['props']['form']['schema'][0]['props']['name'])->toBe('reason');
});

it('serializes a null form when none is attached', function (): void {
    $action = Action::make('plain')->label('Plain');

    $payload = wire($action);

    expect($payload['props']['form'])->toBeNull();
});

it('serializes the full confirmation shape and includes empty effects', function (): void {
    $action = Action::make('simple')->confirm('Sure?');

    $payload = wire($action);

    expect($payload['props']['confirmation'])->toBe([
        'title' => 'Sure?',
        'description' => null,
        'confirmLabel' => null,
        'cancelLabel' => null,
    ]);
    expect($payload['props']['effects'])->toBe([]);
});

it('serializes the action group wire shape', function (): void {
    $group = ActionGroup::make('row-actions')
        ->label('Actions')
        ->actions([Action::make('a')->label('A')]);

    $payload = wire($group);

    expect($payload['type'])->toBe('action.group');
    expect($payload['id'])->toBe('row-actions');
    expect($payload['props'])->toMatchArray(['label' => 'Actions']);
    expect($payload['props']['ref'])->toBeNull();
    expect($payload['schema'])->toHaveCount(1);
    expect($payload['schema'][0]['type'])->toBe('action');
});

it('serializes an inline action group orientation', function (): void {
    $group = ActionGroup::make('locale-switcher')
        ->label('Language')
        ->inline(Orientation::Horizontal)
        ->actions([
            Action::make('locale-en')->label('English'),
            Action::make('locale-de')->label('German'),
        ]);

    $payload = wire($group);

    expect($payload['props'])->toMatchArray([
        'label' => 'Language',
        'orientation' => 'horizontal',
    ]);
    expect($payload['schema'])->toHaveCount(2);
});

it('carries typed props through Action::use from the registry', function (): void {
    Lattice::actions([ArchiveProductAction::class]);

    $payload = wire(Action::use(ArchiveProductAction::class));

    expect($payload['type'])->toBe('action');
    expect($payload['id'])->toBe('workbench.products.archive');
    expect($payload['props'])->toMatchArray([
        'endpoint' => '/lattice/actions/workbench.products.archive',
        'label' => 'Archive',
        'method' => 'patch',
        'variant' => 'destructive',
        'confirmation' => [
            'title' => 'Archive product?',
            'description' => 'This hides the product from the catalogue.',
            'confirmLabel' => null,
            'cancelLabel' => null,
        ],
    ]);
    expect($payload['props']['ref'])->toBeString();
});

it('carries typed props through BulkAction::use from the registry', function (): void {
    Lattice::bulkActions([ArchiveSelectedProductsAction::class]);

    $payload = wire(BulkAction::use(ArchiveSelectedProductsAction::class));

    expect($payload['type'])->toBe('bulkAction');
    expect($payload['id'])->toBe('workbench.products.archive-selected');
    expect($payload['props'])->toMatchArray([
        'endpoint' => '/lattice/bulk-actions/workbench.products.archive-selected',
        'label' => 'Archive selected',
        'method' => 'patch',
        'variant' => 'destructive',
    ]);
    expect($payload['props']['ref'])->toBeString();
});
