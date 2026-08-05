<?php
declare(strict_types=1);

use Lattice\Form\Components\Form;
use Workbench\App\Forms\Fields\BuilderFieldForm;
use Workbench\App\Forms\Fields\RepeaterFieldForm;

use function Pest\Laravel\post;

it('accepts a valid repeater payload through the form endpoint', function (): void {
    $this->actingAs(workbenchTestUser());
    $form = wire(Form::use(RepeaterFieldForm::class));

    post('/lattice/forms/workbench.fields.repeater.form', [
        'items' => [
            ['name' => 'Widget', 'qty' => 2],
            ['name' => 'Gadget', 'qty' => 5],
        ],
    ], $this->latticeHeaders($form))->assertRedirect('/form/fields/repeater');
});

it('rejects a repeater payload missing a required row field', function (): void {
    $this->actingAs(workbenchTestUser());
    $form = wire(Form::use(RepeaterFieldForm::class));

    post('/lattice/forms/workbench.fields.repeater.form', [
        'items' => [
            ['name' => '', 'qty' => 2],
        ],
    ], $this->latticeHeaders($form))->assertSessionHasErrors(['items.0.name']);
});

it('accepts a valid builder payload through the form endpoint', function (): void {
    $this->actingAs(workbenchTestUser());
    $form = wire(Form::use(BuilderFieldForm::class));

    post('/lattice/forms/workbench.fields.builder.form', [
        'items' => [
            ['type' => 'text', 'content' => 'Intro line'],
            ['type' => 'product', 'product' => 'SKU-1', 'qty' => 3, 'price' => '9.50'],
        ],
    ], $this->latticeHeaders($form))->assertRedirect('/form/fields/builder');
});

it('rejects a builder payload missing a required block field', function (): void {
    $this->actingAs(workbenchTestUser());
    $form = wire(Form::use(BuilderFieldForm::class));

    post('/lattice/forms/workbench.fields.builder.form', [
        'items' => [
            ['type' => 'product', 'product' => '', 'qty' => 3, 'price' => '9.50'],
        ],
    ], $this->latticeHeaders($form))->assertSessionHasErrors(['items.0.product']);
});
