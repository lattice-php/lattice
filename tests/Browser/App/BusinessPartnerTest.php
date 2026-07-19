<?php
declare(strict_types=1);

use Workbench\App\Models\Address;
use Workbench\App\Models\BusinessPartner;
use Workbench\App\Models\Group;

it('renders the business partners index page', function (): void {
    $this->visitAsWorkbenchUser('/business-partners')
        ->assertSee('Business partners')
        ->assertNoSmoke();
});

it('creates a business partner via the form', function (): void {
    $this->visitAsWorkbenchUser('/business-partners/create')
        ->assertSee('Create business partner')
        ->fill('input[name="name"]', 'Test Partner')
        ->fill('input[name="email"]', 'partner@example.com')
        ->click('[data-test="repeater-addresses-row-0"] [data-test="row-action-remove"]')
        ->click('@form-submit')
        ->assertSee('Business partners')
        ->assertNoSmoke();
});

it('adds an address row in the repeater and submits', function (): void {
    $this->visitAsWorkbenchUser('/business-partners/create')
        ->assertSee('Create business partner')
        ->assertPresent('[data-test="repeater-addresses-row-0"]')
        ->fill('input[name="name"]', 'Repeater Partner')
        ->fill('input[name="email"]', 'repeater@example.com')
        ->fill('input[name="addresses[0][label]"]', 'HQ')
        ->fill('input[name="addresses[0][line1]"]', '1 Main Street')
        ->fill('input[name="addresses[0][city]"]', 'Berlin')
        ->fill('input[name="addresses[0][postal_code]"]', '10115')
        ->fill('input[name="addresses[0][country]"]', 'DE')
        ->click('@form-submit')
        ->assertSee('Business partners')
        ->assertNoSmoke();
});

it('renders the edit page for an existing partner', function (): void {
    $partner = BusinessPartner::factory()->create(['name' => 'Edit Target Corp']);
    $this->visitAsWorkbenchUser("/business-partners/{$partner->getKey()}/edit")
        ->assertSee('Edit business partner')
        ->assertValue('input[name="name"]', 'Edit Target Corp')
        ->assertNoSmoke();
});

it('prefills addresses on the edit page', function (): void {
    $partner = BusinessPartner::factory()->create();
    Address::factory()->create([
        'business_partner_id' => $partner->getKey(),
        'label' => 'Warehouse',
        'city' => 'Hamburg',
    ]);
    $this->visitAsWorkbenchUser("/business-partners/{$partner->getKey()}/edit")
        ->assertPresent('[data-test="repeater-addresses-row-0"]')
        ->assertValue('input[name="addresses[0][label]"]', 'Warehouse')
        ->assertNoSmoke();
});

it('shows groups dropdown on the create form', function (): void {
    Group::factory()->create(['name' => 'VIP Group']);
    $this->visitAsWorkbenchUser('/business-partners/create')
        ->assertSee('Groups')
        ->assertNoSmoke();
});
