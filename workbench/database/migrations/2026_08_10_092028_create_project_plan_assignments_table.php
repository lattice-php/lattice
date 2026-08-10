<?php
declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_plan_assignments', function (Blueprint $table): void {
            $table->string('id')->primary();
            $table->string('resource_id');
            $table->string('label');
            $table->date('starts_on');
            $table->date('ends_on');
            $table->string('color')->nullable();
            $table->timestamps();
            $table->index(['starts_on', 'ends_on']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_plan_assignments');
    }
};
