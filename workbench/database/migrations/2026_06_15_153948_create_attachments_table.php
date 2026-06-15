<?php
declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attachments', function (Blueprint $table): void {
            $table->foreignId('file_id')->constrained()->cascadeOnDelete();
            $table->morphs('attachable');
            $table->unsignedSmallInteger('sort_order')->default(1);
            $table->timestamps();

            $table->primary(['file_id', 'attachable_type', 'attachable_id']);
            $table->index(['attachable_type', 'attachable_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attachments');
    }
};
