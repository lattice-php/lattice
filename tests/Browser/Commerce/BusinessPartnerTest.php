<?php
declare(strict_types=1);

use Workbench\App\Models\Address;
use Workbench\App\Models\BusinessPartner;
use Workbench\App\Models\Group;

it('renders the business partners index page', function (): void {
    $this->actingAs(workbenchTestUser());
    visit('/business-partners')
        ->assertSee('Business partners')
        ->assertNoSmoke();
});

it('creates a business partner via the form', function (): void {
    $this->actingAs(workbenchTestUser());
    visit('/business-partners/create')
        ->assertSee('Create business partner')
        ->fill('input[name="name"]', 'Test Partner')
        ->fill('input[name="email"]', 'partner@example.com')
        ->click('Create business partner')
        ->assertSee('Business partners')
        ->assertNoSmoke()
        ->assertNoJavaScriptErrors();
});

it('adds an address row in the repeater and submits', function (): void {
    $this->actingAs(workbenchTestUser());
    visit('/business-partners/create')
        ->assertSee('Create business partner')
        ->fill('input[name="name"]', 'Repeater Partner')
        ->fill('input[name="email"]', 'repeater@example.com')
        ->click('@repeater-addresses-add')
        ->assertPresent('[data-test="repeater-addresses-row-0"]')
        ->fill('input[name="addresses[0][label]"]', 'HQ')
        ->fill('input[name="addresses[0][line1]"]', '1 Main Street')
        ->fill('input[name="addresses[0][city]"]', 'Berlin')
        ->fill('input[name="addresses[0][postal_code]"]', '10115')
        ->fill('input[name="addresses[0][country]"]', 'DE')
        ->click('Create business partner')
        ->assertSee('Business partners')
        ->assertNoSmoke()
        ->assertNoJavaScriptErrors();
});

it('renders the edit page for an existing partner', function (): void {
    $partner = BusinessPartner::factory()->create(['name' => 'Edit Target Corp']);
    $this->actingAs(workbenchTestUser());

    visit("/business-partners/{$partner->getKey()}/edit")
        ->assertSee('Edit business partner')
        ->assertSee('Edit Target Corp')
        ->assertNoSmoke();
});

it('prefills addresses on the edit page', function (): void {
    $partner = BusinessPartner::factory()->create();
    Address::factory()->create([
        'business_partner_id' => $partner->getKey(),
        'label' => 'Warehouse',
        'city' => 'Hamburg',
    ]);
    $this->actingAs(workbenchTestUser());

    visit("/business-partners/{$partner->getKey()}/edit")
        ->assertPresent('[data-test="repeater-addresses-row-0"]')
        ->assertSee('Warehouse')
        ->assertNoSmoke()
        ->assertNoJavaScriptErrors();
});

it('shows groups dropdown on the create form', function (): void {
    Group::factory()->create(['name' => 'VIP Group']);
    $this->actingAs(workbenchTestUser());

    visit('/business-partners/create')
        ->assertSee('Groups')
        ->assertNoSmoke();
});
