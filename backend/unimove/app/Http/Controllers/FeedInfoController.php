<?php
namespace App\Http\Controllers;

use App\Models\FeedInfo;
use Illuminate\Http\Request;

class FeedInfoController extends Controller
{
    public function index(Request $request)
    {
        $sortable = ['feed_publisher_name','feed_lang','feed_start_date','feed_end_date','feed_version'];
        $sort = in_array($request->sort, $sortable) ? $request->sort : 'feed_publisher_name';
        $dir  = $request->dir === 'desc' ? 'desc' : 'asc';

        $feedInfos = FeedInfo::query()
            ->when($request->search, fn($q) => $q
                ->where('feed_publisher_name','like', "%{$request->search}%")
                ->orWhere('feed_lang',         'like', "%{$request->search}%")
                ->orWhere('feed_version',      'like', "%{$request->search}%")
            )
            ->orderBy($sort, $dir)
            ->paginate(15)
            ->withQueryString();

        return response()->json($feedInfos);
    }

    public function show(Request $request)
    {
        return response()->json(
            FeedInfo::where('feed_publisher_name', $request->feed_publisher_name)->firstOrFail()
        );
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

        $feedInfo = FeedInfo::create($request->all());
        return response()->json(['message' => 'Feed info creado correctamente', 'data' => $feedInfo], 201);
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

        return response()->json(['message' => 'Feed info actualizado correctamente', 'data' => $feedInfo]);
    }

    public function destroy(Request $request)
    {
        FeedInfo::where('feed_publisher_name', $request->feed_publisher_name)->delete();
        return response()->json(['message' => 'Feed info eliminado correctamente']);
    }
}
