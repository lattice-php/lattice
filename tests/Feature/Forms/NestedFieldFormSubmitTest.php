<?php
declare(strict_types=1);

use Lattice\Form\Components\Form;
use Workbench\App\Forms\Fields\BuilderFieldForm;
use Workbench\App\Forms\Fields\RepeaterFieldForm;

use function Pest\Laravel\post;

dataset('nested field forms', [
    'repeater' => [
        RepeaterFieldForm::class,
        '/lattice/forms/workbench.fields.repeater.form',
        [
            ['name' => 'Widget', 'qty' => 2],
            ['name' => 'Gadget', 'qty' => 5],
        ],
        '/form/fields/repeater',
        [
            ['name' => '', 'qty' => 2],
        ],
        'items.0.name',
    ],
    'builder' => [
        BuilderFieldForm::class,
        '/lattice/forms/workbench.fields.builder.form',
        [
            ['type' => 'text', 'content' => 'Intro line'],
            ['type' => 'product', 'product' => 'SKU-1', 'qty' => 3, 'price' => '9.50'],
        ],
        '/form/fields/builder',
        [
            ['type' => 'product', 'product' => '', 'qty' => 3, 'price' => '9.50'],
        ],
        'items.0.product',
    ],
]);

it('accepts a valid nested rows payload through the form endpoint', function (string $formClass, string $action, array $validItems, string $redirect): void {
    $this->actingAs(workbenchTestUser());
    $form = wire(Form::use($formClass));

    post($action, ['items' => $validItems], $this->latticeHeaders($form))
        ->assertRedirect($redirect);
})->with('nested field forms');

it('rejects a nested rows payload missing a required row field', function (string $formClass, string $action, array $validItems, string $redirect, array $invalidItems, string $errorKey): void {
    $this->actingAs(workbenchTestUser());
    $form = wire(Form::use($formClass));

    post($action, ['items' => $invalidItems], $this->latticeHeaders($form))
        ->assertSessionHasErrors([$errorKey]);
})->with('nested field forms');
