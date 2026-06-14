<?php
declare(strict_types=1);

namespace Workbench\App\Seeders;

use Illuminate\Database\Seeder;
use Workbench\App\Models\Address;
use Workbench\App\Models\BusinessPartner;
use Workbench\App\Models\Group;

class BusinessPartnerSeeder extends Seeder
{
    public function run(): void
    {
        $retail = Group::query()->where('name', 'Retail')->firstOrFail();
        $wholesale = Group::query()->where('name', 'Wholesale')->firstOrFail();
        $vip = Group::query()->where('name', 'VIP')->firstOrFail();

        $partners = [
            [
                'name' => 'Acme Corporation',
                'email' => 'contact@acme.example.com',
                'groups' => [$retail->id],
            ],
            [
                'name' => 'Global Trade GmbH',
                'email' => 'info@globaltrade.example.com',
                'groups' => [$wholesale->id, $retail->id],
            ],
            [
                'name' => 'Elite Partners Ltd',
                'email' => 'hello@elitepartners.example.com',
                'groups' => [$vip->id, $wholesale->id],
            ],
        ];

        foreach ($partners as $data) {
            $partner = BusinessPartner::query()->firstOrCreate(
                ['email' => $data['email']],
                ['name' => $data['name']],
            );

            $partner->groups()->sync($data['groups']);

            if ($partner->addresses()->count() === 0) {
                $shipping = Address::factory()->create([
                    'business_partner_id' => $partner->id,
                    'label' => 'HQ',
                ]);

                $billing = Address::factory()->create([
                    'business_partner_id' => $partner->id,
                    'label' => 'Billing',
                ]);

                $partner->update([
                    'default_shipping_address_id' => $shipping->id,
                    'default_billing_address_id' => $billing->id,
                ]);
            }
        }
    }
}
