<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCommunityInfoRequest;
use App\Http\Requests\UpdateCommunityInfoRequest;
use App\Models\CommunityInfo;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CommunityController extends Controller
{
    public function index(Request $request): Response
    {
        $query = CommunityInfo::query()->with('creator:id,name');

        $type = $request->string('type')->toString();
        $search = $request->string('search')->toString();
        $status = $request->string('status')->toString();

        if (in_array($type, CommunityInfo::TYPES, true)) {
            $query->where('type', $type);
        }

        if ($search !== '') {
            $query->where('title', 'like', "%{$search}%");
        }

        if ($status === 'published') {
            $query->where('is_published', true);
        } elseif ($status === 'unpublished') {
            $query->where('is_published', false);
        }

        $infos = $query->orderByDesc('created_at')->paginate(12)->withQueryString();

        $drawer = $this->drawerPayload($request);

        if ($drawer !== null) {
            $infos->appends($request->except(['drawer', 'id']));
        }

        return Inertia::render('Admin/Community/Index', [
            'infos' => $infos,
            'filters' => ['type' => $type, 'search' => $search, 'status' => $status],
            'drawer' => $drawer,
        ]);
    }

    private function drawerPayload(Request $request): ?array
    {
        $mode = $request->string('drawer')->toString();

        if (! in_array($mode, ['create', 'edit'], true)) {
            return null;
        }

        $drawer = ['mode' => $mode];

        if ($mode === 'edit') {
            $info = CommunityInfo::query()->find($request->integer('id'));

            if ($info) {
                $drawer['info'] = $info;
            }
        }

        return $drawer;
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Community/Create');
    }

    public function store(StoreCommunityInfoRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $isPublished = (bool) ($validated['is_published'] ?? false);

        CommunityInfo::create([
            'type' => $validated['type'],
            'title' => $validated['title'],
            'content' => $validated['content'],
            'image' => $request->hasFile('image') ? $request->file('image')->store('community-images', 'public') : null,
            'event_date' => $validated['event_date'] ?? null,
            'location' => $validated['location'] ?? null,
            'is_published' => $isPublished,
            'published_at' => $isPublished ? now() : null,
            'created_by' => $request->user()->id,
        ]);

        return redirect()
            ->route('admin.community.index')
            ->with('success', 'Community information created successfully.');
    }

    public function edit(CommunityInfo $info): Response
    {
        return Inertia::render('Admin/Community/Edit', [
            'info' => $info,
        ]);
    }

    public function update(UpdateCommunityInfoRequest $request, CommunityInfo $info): RedirectResponse
    {
        $validated = $request->validated();

        $isPublished = (bool) ($validated['is_published'] ?? false);

        if ($request->hasFile('image')) {
            if ($info->image) {
                Storage::disk('public')->delete($info->image);
            }

            $validated['image'] = $request->file('image')->store('community-images', 'public');
        }

        $info->update([
            'type' => $validated['type'],
            'title' => $validated['title'],
            'content' => $validated['content'],
            'image' => $validated['image'] ?? $info->image,
            'event_date' => $validated['event_date'] ?? null,
            'location' => $validated['location'] ?? null,
            'is_published' => $isPublished,
            'published_at' => $isPublished ? ($info->published_at ?? now()) : null,
        ]);

        return redirect()
            ->route('admin.community.index')
            ->with('success', 'Community information updated successfully.');
    }

    public function destroy(CommunityInfo $info): RedirectResponse
    {
        $info->delete();

        return redirect()
            ->route('admin.community.index')
            ->with('success', 'Community information deleted.');
    }
}