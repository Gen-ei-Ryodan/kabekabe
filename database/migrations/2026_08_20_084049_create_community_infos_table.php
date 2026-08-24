<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('community_infos', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['event', 'announcement', 'news', 'agenda'])->default('announcement')->index();
            $table->string('title');
            $table->text('content');
            $table->string('image')->nullable();
            $table->timestamp('event_date')->nullable();
            $table->string('location')->nullable();
            $table->boolean('is_published')->default(false)->index();
            $table->timestamp('published_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['type', 'is_published']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('community_infos');
    }
};