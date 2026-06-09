<?php

declare(strict_types=1);

use Bambamboole\Lattice\Contracts\HasLabel;
use Bambamboole\Lattice\Forms\Components\Choice;

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
    $options = Choice::make('status', 'Status')->enum(PlainStatus::class)->toArray()['props']['options'];

    expect($options)->toBe([
        ['label' => 'Draft', 'value' => 'draft'],
        ['label' => 'In Review', 'value' => 'in_review'],
    ]);
});

it('uses the HasLabel contract for labels and supports translations', function (): void {
    app('translator')->addLines([
        'status.active' => 'Aktiv',
        'status.archived' => 'Archiviert',
    ], 'de');
    app()->setLocale('de');

    $options = Choice::make('status', 'Status')->enum(LabelledStatus::class)->toArray()['props']['options'];

    expect($options)->toBe([
        ['label' => 'Aktiv', 'value' => 'active'],
        ['label' => 'Archiviert', 'value' => 'archived'],
    ]);
});

it('builds options from a subset of enum cases', function (): void {
    $options = Choice::make('status', 'Status')
        ->enum([PlainStatus::Draft])
        ->toArray()['props']['options'];

    expect($options)->toBe([
        ['label' => 'Draft', 'value' => 'draft'],
    ]);
});
