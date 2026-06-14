<?php
declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('business_partners', function (Blueprint $table): void {
            $table->foreignId('default_shipping_address_id')->nullable()->after('email')->constrained('addresses')->nullOnDelete();
            $table->foreignId('default_billing_address_id')->nullable()->after('default_shipping_address_id')->constrained('addresses')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('business_partners', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('default_shipping_address_id');
            $table->dropConstrainedForeignId('default_billing_address_id');
        });
    }
};
