<?php
declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('business_partner_group', function (Blueprint $table): void {
            $table->foreignId('business_partner_id')->constrained()->cascadeOnDelete();
            $table->foreignId('group_id')->constrained()->cascadeOnDelete();
            $table->primary(['business_partner_id', 'group_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('business_partner_group');
    }
};
