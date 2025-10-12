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
        Schema::table('students', function (Blueprint $table) {
            $table->foreignId('assigned_class_id')->nullable()->after('is_submitted')->constrained('classes')->onDelete('set null');
            $table->enum('placement_status', ['pending', 'placed', 'flagged', 'manually_assigned'])->default('pending')->after('assigned_class_id');
            $table->text('placement_notes')->nullable()->after('placement_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropForeign(['assigned_class_id']);
            $table->dropColumn(['assigned_class_id', 'placement_status', 'placement_notes']);
        });
    }
};
