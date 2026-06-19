<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Forms\Components\Form;
use Workbench\App\Forms\BusinessPartnerForm;
use Workbench\App\Models\Address;
use Workbench\App\Models\BusinessPartner;
use Workbench\App\Models\Group;
use Workbench\App\Models\Product;
use Workbench\App\Models\SalesPrice;

use function Pest\Laravel\get;
use function Pest\Laravel\patch;
use function Pest\Laravel\post;
use function Pest\Laravel\withoutVite;

test('the business partner create page renders', function (): void {
    withoutVite();
    $this->actingAs(workbenchTestUser());

    get('/business-partners/create')->assertOk();
});

test('the business partner form creates a partner with groups and addresses', function (): void {
    Lattice::forms([BusinessPartnerForm::class]);

    $group = Group::factory()->create();
    $form = wire(Form::use(BusinessPartnerForm::class));

    post('/lattice/forms/workbench.business-partners.form', [
        'name' => 'Acme Corp',
        'email' => 'acme@example.com',
        'groups' => [(string) $group->getKey()],
        'addresses' => [
            [
                'id' => '',
                'label' => 'HQ',
                'line1' => '1 Main St',
                'line2' => null,
                'city' => 'Berlin',
                'postal_code' => '10115',
                'country' => 'DE',
            ],
        ],
    ], ['X-Lattice-Ref' => componentRef($form)])
        ->assertRedirect('/business-partners');

    $partner = BusinessPartner::query()->where('name', 'Acme Corp')->firstOrFail();
    expect($partner->email)->toBe('acme@example.com');
    expect($partner->groups()->count())->toBe(1);
    expect($partner->addresses()->count())->toBe(1);
    expect($partner->addresses()->first()->city)->toBe('Berlin');
});

test('the business partner form updates default address FKs', function (): void {
    Lattice::forms([BusinessPartnerForm::class]);

    $partner = BusinessPartner::factory()->create();
    $shipping = Address::factory()->create(['business_partner_id' => $partner->getKey()]);
    $billing = Address::factory()->create(['business_partner_id' => $partner->getKey()]);

    $form = wire(Form::use(BusinessPartnerForm::class)
        ->context(['business_partner_id' => $partner->getKey()]));

    patch('/lattice/forms/workbench.business-partners.form', [
        'name' => $partner->name,
        'email' => $partner->email,
        'groups' => [],
        'addresses' => [
            [
                'id' => (string) $shipping->getKey(),
                'label' => $shipping->label,
                'line1' => $shipping->line1,
                'line2' => $shipping->line2,
                'city' => $shipping->city,
                'postal_code' => $shipping->postal_code,
                'country' => $shipping->country,
            ],
            [
                'id' => (string) $billing->getKey(),
                'label' => $billing->label,
                'line1' => $billing->line1,
                'line2' => $billing->line2,
                'city' => $billing->city,
                'postal_code' => $billing->postal_code,
                'country' => $billing->country,
            ],
        ],
        'default_shipping_address_id' => (string) $shipping->getKey(),
        'default_billing_address_id' => (string) $billing->getKey(),
    ], ['X-Lattice-Ref' => componentRef($form)])
        ->assertRedirect('/business-partners');

    $partner->refresh();
    expect($partner->default_shipping_address_id)->toBe($shipping->getKey())
        ->and($partner->default_billing_address_id)->toBe($billing->getKey());
});

test('the business partner edit page renders the effective prices panel', function (): void {
    Lattice::forms([BusinessPartnerForm::class]);

    $partner = BusinessPartner::factory()->create();
    $product = Product::factory()->withoutDefaultPrice()->create(['name' => 'Widget Pro']);
    SalesPrice::factory()->create(['product_id' => $product->getKey(), 'group_id' => null, 'amount' => '99.00']);

    $formDef = (new BusinessPartnerForm)->withContext(['business_partner_id' => $partner->getKey()]);
    $request = Request::create('/test', 'GET');

    $schema = wire($formDef->definition(Form::make('workbench.business-partners.form'), $request))['schema'];

    expect($schema[1]['props']['title'])->toBe('Effective prices');
    expect($schema[1]['schema'][0]['props']['text'])->toBe('Widget Pro: 99.00');
});

test('the business partner form deletes removed addresses', function (): void {
    Lattice::forms([BusinessPartnerForm::class]);

    $partner = BusinessPartner::factory()->create();
    $keep = Address::factory()->create(['business_partner_id' => $partner->getKey()]);
    $remove = Address::factory()->create(['business_partner_id' => $partner->getKey()]);

    $form = wire(Form::use(BusinessPartnerForm::class)
        ->context(['business_partner_id' => $partner->getKey()]));

    patch('/lattice/forms/workbench.business-partners.form', [
        'name' => $partner->name,
        'email' => $partner->email,
        'groups' => [],
        'addresses' => [
            [
                'id' => (string) $keep->getKey(),
                'label' => $keep->label,
                'line1' => $keep->line1,
                'line2' => $keep->line2,
                'city' => $keep->city,
                'postal_code' => $keep->postal_code,
                'country' => $keep->country,
            ],
        ],
    ], ['X-Lattice-Ref' => componentRef($form)])
        ->assertRedirect('/business-partners');

    expect($partner->addresses()->count())->toBe(1);
    expect(Address::query()->find($remove->getKey()))->toBeNull();
});

test('removing the default shipping address nulls the FK on the partner', function (): void {
    Lattice::forms([BusinessPartnerForm::class]);

    $partner = BusinessPartner::factory()->create();
    $shipping = Address::factory()->create(['business_partner_id' => $partner->getKey()]);
    $other = Address::factory()->create(['business_partner_id' => $partner->getKey()]);

    $partner->update(['default_shipping_address_id' => $shipping->getKey()]);

    $form = wire(Form::use(BusinessPartnerForm::class)
        ->context(['business_partner_id' => $partner->getKey()]));

    patch('/lattice/forms/workbench.business-partners.form', [
        'name' => $partner->name,
        'email' => $partner->email,
        'groups' => [],
        'addresses' => [
            [
                'id' => (string) $other->getKey(),
                'label' => $other->label,
                'line1' => $other->line1,
                'line2' => $other->line2,
                'city' => $other->city,
                'postal_code' => $other->postal_code,
                'country' => $other->country,
            ],
        ],
    ], ['X-Lattice-Ref' => componentRef($form)])
        ->assertRedirect('/business-partners');

    $partner->refresh();
    expect($partner->default_shipping_address_id)->toBeNull();
});
