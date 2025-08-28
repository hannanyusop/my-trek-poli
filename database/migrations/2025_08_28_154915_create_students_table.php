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
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('registration_session_id')->constrained()->cascadeOnDelete();
            $table->string('matric_number');
            $table->string('identification_number');
            $table->string('name');
            $table->enum('gender', ['male', 'female']);
            $table->string('race');
            $table->string('religion');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->boolean('is_submitted')->default(false);
            $table->timestamps();

            $table->unique(['registration_session_id', 'matric_number'], 'students_session_matric_unique');
            $table->unique(['registration_session_id', 'identification_number'], 'students_session_ic_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
