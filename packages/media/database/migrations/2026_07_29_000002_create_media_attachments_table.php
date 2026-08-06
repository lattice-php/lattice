<?php
declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media_attachments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('media_id')->constrained('media')->cascadeOnDelete();
            $table->morphs('attachable');
            $table->string('collection')->default('default');
            $table->unsignedSmallInteger('sort_order')->default(1);
            $table->json('meta')->nullable();
            $table->timestamps();
            $table->unique(['media_id', 'attachable_type', 'attachable_id', 'collection'], 'media_attachments_unique');
            $table->index(['attachable_type', 'attachable_id', 'collection', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media_attachments');
    }
};
