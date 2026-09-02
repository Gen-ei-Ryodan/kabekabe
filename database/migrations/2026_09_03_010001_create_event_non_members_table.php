<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_non_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('community_infos')->cascadeOnDelete();
            $table->string('name');
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->boolean('attended')->default(false);
            $table->timestamp('attended_at')->nullable();
            $table->timestamps();

            $table->index(['event_id', 'attended']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_non_members');
    }
};
