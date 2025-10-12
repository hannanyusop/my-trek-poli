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
        Schema::create('placement_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('registration_session_id')->constrained()->onDelete('cascade');
            $table->foreignId('student_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('class_id')->nullable()->constrained('classes')->onDelete('set null');
            $table->integer('track_priority')->nullable()->comment('Which priority was used: 1, 2, or 3');
            $table->enum('action', ['auto_assigned', 'manual_assigned', 'swapped', 'cleared', 'flagged'])->default('auto_assigned');
            $table->foreignId('performed_by_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('previous_class_id')->nullable()->constrained('classes')->onDelete('set null');
            $table->text('notes')->nullable();
            $table->json('balance_metrics')->nullable()->comment('Snapshot of gender/race distribution at assignment time');
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('placement_audit_logs');
    }
};
