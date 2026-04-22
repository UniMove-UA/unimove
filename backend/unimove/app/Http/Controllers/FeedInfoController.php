<?php

namespace App\Http\Controllers;

use App\Models\FeedInfo;
use Illuminate\Http\Request;

class FeedInfoController extends Controller
{
    public function index()
    {
        $feedInfos = FeedInfo::all();
        return view('feed_info.index', compact('feedInfos'));
    }

    public function show(Request $request)
    {
        $feedInfo = FeedInfo::where('feed_publisher_name', $request->feed_publisher_name)->firstOrFail();
        return view('feed_info.show', compact('feedInfo'));
    }

    public function create()
    {
        return view('feed_info.create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'feed_publisher_name' => 'required|string',
            'feed_publisher_url'  => 'required|string',
            'feed_lang'           => 'required|string',
            'feed_start_date'     => 'nullable|string|max:8',
            'feed_end_date'       => 'nullable|string|max:8',
            'feed_version'        => 'nullable|string',
        ]);

        FeedInfo::create($request->all());

        return redirect()->route('feed-info.index')->with('success', 'Feed info creado correctamente.');
    }

    public function edit(Request $request)
    {
        $feedInfo = FeedInfo::where('feed_publisher_name', $request->feed_publisher_name)->firstOrFail();
        return view('feed_info.edit', compact('feedInfo'));
    }

    public function update(Request $request)
    {
        $request->validate([
            'feed_publisher_name' => 'required|string',
            'feed_publisher_url'  => 'required|string',
            'feed_lang'           => 'required|string',
            'feed_start_date'     => 'nullable|string|max:8',
            'feed_end_date'       => 'nullable|string|max:8',
            'feed_version'        => 'nullable|string',
        ]);

        $feedInfo = FeedInfo::where('feed_publisher_name', $request->feed_publisher_name)->firstOrFail();
        $feedInfo->update($request->all());

        return redirect()->route('feed-info.index')->with('success', 'Feed info actualizado correctamente.');
    }

    public function destroy(Request $request)
    {
        FeedInfo::where('feed_publisher_name', $request->feed_publisher_name)->delete();

        return redirect()->route('feed-info.index')->with('success', 'Feed info eliminado correctamente.');
    }
}
