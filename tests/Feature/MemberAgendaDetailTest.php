<?php

namespace Tests\Feature;

use App\Models\CommunityInfo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class MemberAgendaDetailTest extends TestCase
{
    use RefreshDatabase;

    public function test_published_agenda_detail_can_be_viewed_by_member(): void
    {
        $member = User::factory()->member()->create();
        $agenda = CommunityInfo::factory()->published()->create([
            'type' => CommunityInfo::TYPE_AGENDA,
        ]);

        $this->actingAs($member)
            ->get(route('member.agendas.show', $agenda))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Member/Agendas/Show')
                ->where('agenda.id', $agenda->id)
                ->where('agenda.title', $agenda->title));
    }

    public function test_unpublished_agenda_returns_404(): void
    {
        $member = User::factory()->member()->create();
        $agenda = CommunityInfo::factory()->draft()->create([
            'type' => CommunityInfo::TYPE_AGENDA,
        ]);

        $this->actingAs($member)
            ->get(route('member.agendas.show', $agenda))
            ->assertNotFound();
    }

    public function test_agenda_detail_requires_member_role(): void
    {
        $admin = User::factory()->admin()->create();
        $agenda = CommunityInfo::factory()->published()->create([
            'type' => CommunityInfo::TYPE_AGENDA,
        ]);

        $this->actingAs($admin)
            ->get(route('member.agendas.show', $agenda))
            ->assertForbidden();
    }
}
