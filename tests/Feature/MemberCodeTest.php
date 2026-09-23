<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class MemberCodeTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    public function test_member_code_uses_7030_yymm_nnn_format_and_resets_monthly(): void
    {
        Carbon::setTestNow('2026-09-15 10:00:00');

        $first = User::factory()->member()->create();
        $second = User::factory()->member()->create();

        $this->assertSame('70302609001', $first->member_code);
        $this->assertSame('70302609002', $second->member_code);

        Carbon::setTestNow('2026-10-01 10:00:00');

        $nextMonth = User::factory()->member()->create();

        $this->assertSame('70302610001', $nextMonth->member_code);
    }

    public function test_legacy_10_digit_codes_do_not_affect_sequence(): void
    {
        Carbon::setTestNow('2026-09-15 10:00:00');

        User::factory()->member()->create(['member_code' => '7030260901']);
        $member = User::factory()->member()->create();

        $this->assertSame('70302609001', $member->member_code);
    }
}
