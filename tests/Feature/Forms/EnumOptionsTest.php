<?php
declare(strict_types=1);

use Lattice\Core\Contracts\HasLabel;
use Lattice\Form\Components\Choice;

enum PlainStatus: string
{
    case Draft = 'draft';
    case InReview = 'in_review';
}

enum LabelledStatus: string implements HasLabel
{
    case Active = 'active';
    case Archived = 'archived';

    public function getLabel(): string
    {
        return __("status.{$this->value}");
    }
}

it('builds options from an enum class using humanised names by default', function (): void {
    $options = wire(Choice::make('status', 'Status')->enum(PlainStatus::class))['props']['options'];

    expect($options)->toBe([
        ['label' => 'Draft', 'value' => 'draft', 'data' => null, 'description' => null, 'group' => null, 'tooltip' => null],
        ['label' => 'In Review', 'value' => 'in_review', 'data' => null, 'description' => null, 'group' => null, 'tooltip' => null],
    ]);
});

it('uses the HasLabel contract for labels and supports translations', function (): void {
    app('translator')->addLines([
        'status.active' => 'Aktiv',
        'status.archived' => 'Archiviert',
    ], 'de');
    app()->setLocale('de');

    $options = wire(Choice::make('status', 'Status')->enum(LabelledStatus::class))['props']['options'];

    expect($options)->toBe([
        ['label' => 'Aktiv', 'value' => 'active', 'data' => null, 'description' => null, 'group' => null, 'tooltip' => null],
        ['label' => 'Archiviert', 'value' => 'archived', 'data' => null, 'description' => null, 'group' => null, 'tooltip' => null],
    ]);
});

it('builds options from a subset of enum cases', function (): void {
    $options = wire(Choice::make('status', 'Status')
        ->enum([PlainStatus::Draft]))['props']['options'];

    expect($options)->toBe([
        ['label' => 'Draft', 'value' => 'draft', 'data' => null, 'description' => null, 'group' => null, 'tooltip' => null],
    ]);
});
