<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\CommunityInfo;
use Inertia\Inertia;
use Inertia\Response;

class AgendaController extends Controller
{
    /**
     * Tampilkan detail agenda/event untuk member.
     */
    public function show(CommunityInfo $info): Response
    {
        abort_unless($info->is_published, 404);
        abort_unless(in_array($info->type, CommunityInfo::TYPES, true), 404);

        return Inertia::render('Member/Agendas/Show', [
            'agenda' => [
                'id' => $info->id,
                'type' => $info->type,
                'title' => $info->title,
                'content' => $info->content,
                'image_url' => $info->image_url,
                'event_date' => $info->event_date?->toDateString(),
                'location' => $info->location,
                'fee' => $info->fee,
            ],
        ]);
    }
}
