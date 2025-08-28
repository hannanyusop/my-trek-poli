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
        Schema::create('student_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('registration_session_track_id')->nullable()->constrained()->cascadeOnDelete();
            $table->integer('priority');
            $table->timestamps();

            $table->unique(['student_id', 'registration_session_track_id'], 'student_prefs_student_track_unique');
            $table->unique(['student_id', 'priority'], 'student_prefs_student_priority_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_preferences');
    }
};
