<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('placements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('assigned_class_id')->nullable()->constrained('classes')->nullOnDelete();
            $table->enum('placement_status', ['pending', 'placed', 'flagged', 'manually_assigned'])->default('pending');
            $table->text('placement_notes')->nullable();
            $table->integer('track_priority')->nullable()->comment('Which priority was used: 1, 2, or 3');
            $table->enum('assigned_by', ['system', 'admin'])->default('system');
            $table->foreignId('admin_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('assigned_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['student_id', 'is_active'], 'placements_student_active_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('placements');
    }
};
