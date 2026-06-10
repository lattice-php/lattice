<?php

declare(strict_types=1);

use Lattice\Lattice\Actions\Components\Action;
use Lattice\Lattice\Actions\Components\ActionGroup;
use Lattice\Lattice\Actions\Components\BulkAction;
use Lattice\Lattice\Actions\Effect;
use Lattice\Lattice\Core\Enums\HttpMethod;
use Lattice\Lattice\Core\Enums\LucideIcon;
use Lattice\Lattice\Facades\Lattice;
use Workbench\App\Actions\ArchiveProductAction;
use Workbench\App\Actions\ArchiveSelectedProductsAction;

it('serializes the action wire shape', function (): void {
    $action = Action::make('archive')
        ->endpoint('/lattice/actions/archive')
        ->label('Archive')
        ->method(HttpMethod::Patch)
        ->icon(LucideIcon::Send)
        ->variant('destructive')
        ->confirm('Archive product?', 'This hides the product.', 'Archive', 'Keep')
        ->effects([Effect::reloadComponent('table'), Effect::reloadPage()]);

    $payload = json_decode(json_encode($action), true);

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

it('accepts arbitrary string icons and method strings', function (): void {
    $action = Action::make('custom')
        ->icon('custom.spark')
        ->method('delete');

    $payload = json_decode(json_encode($action), true);

    expect($payload['props']['icon'])->toBe('custom.spark');
    expect($payload['props']['method'])->toBe('delete');
});

it('drops null confirmation entries and omits empty effects', function (): void {
    $action = Action::make('simple')->confirm('Sure?');

    $payload = json_decode(json_encode($action), true);

    expect($payload['props']['confirmation'])->toBe(['title' => 'Sure?']);
    expect($payload['props'])->not->toHaveKey('effects');
});

it('serializes the action group wire shape', function (): void {
    $group = ActionGroup::make('row-actions')
        ->label('Actions')
        ->actions([Action::make('a')->label('A')]);

    $payload = json_decode(json_encode($group), true);

    expect($payload['type'])->toBe('action.group');
    expect($payload['id'])->toBe('row-actions');
    expect($payload['props'])->toMatchArray(['label' => 'Actions']);
    expect($payload['props'])->not->toHaveKey('ref');
    expect($payload['schema'])->toHaveCount(1);
    expect($payload['schema'][0]['type'])->toBe('action');
});

it('carries typed props through Action::use from the registry', function (): void {
    Lattice::actions([ArchiveProductAction::class]);

    $payload = json_decode(json_encode(Action::use(ArchiveProductAction::class)), true);

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
        ],
    ]);
    expect($payload['props']['ref'])->toBeString();
});

it('carries typed props through BulkAction::use from the registry', function (): void {
    Lattice::bulkActions([ArchiveSelectedProductsAction::class]);

    $payload = json_decode(json_encode(BulkAction::use(ArchiveSelectedProductsAction::class)), true);

    expect($payload['type'])->toBe('bulkAction');
    expect($payload['id'])->toBe('workbench.products.archive-selected');
    expect($payload['props'])->toMatchArray([
        'endpoint' => '/lattice/bulk-actions/workbench.products.archive-selected',
        'label' => 'Archive selected',
        'method' => 'patch',
    ]);
    expect($payload['props']['ref'])->toBeString();
});
