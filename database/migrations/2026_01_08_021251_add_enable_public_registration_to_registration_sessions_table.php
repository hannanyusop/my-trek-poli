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
        Schema::table('registration_sessions', function (Blueprint $table) {
            $table->boolean('enable_public_registration')->default(false)->after('description');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('registration_sessions', function (Blueprint $table) {
            $table->dropColumn('enable_public_registration');
        });
    }
};
