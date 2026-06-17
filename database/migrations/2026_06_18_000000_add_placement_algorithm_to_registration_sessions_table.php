<?php

use App\Enums\PlacementAlgorithm;
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
            $table->string('placement_algorithm')
                ->default(PlacementAlgorithm::GlobalBalance->value)
                ->after('enable_public_registration');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('registration_sessions', function (Blueprint $table) {
            $table->dropColumn('placement_algorithm');
        });
    }
};
