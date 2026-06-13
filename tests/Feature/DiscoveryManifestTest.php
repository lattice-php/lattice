<?php

declare(strict_types=1);

use Lattice\Lattice\Attributes\Action;
use Lattice\Lattice\Attributes\BulkAction;
use Lattice\Lattice\Attributes\Form;
use Lattice\Lattice\Attributes\Fragment;
use Lattice\Lattice\Attributes\Layout;
use Lattice\Lattice\Attributes\Table;
use Lattice\Lattice\Core\Discovery\DiscoveryKinds;
use Lattice\Lattice\Tests\Fixtures\Discovery\DiscoveredProfileForm;

test('discovery kinds map every component group to its attribute', function () {
    expect(DiscoveryKinds::COMPONENTS)->toMatchArray([
        'forms' => Form::class,
        'tables' => Table::class,
        'actions' => Action::class,
        'bulk-actions' => BulkAction::class,
        'fragments' => Fragment::class,
        'layouts' => Layout::class,
    ]);
});

test('discovery kinds extracts a component key from its attribute', function () {
    expect(DiscoveryKinds::keyOf(DiscoveredProfileForm::class, Form::class))
        ->toBe('fixtures.profile');
});
