<?php
namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    public function myReviews()
    {
        $reviews = Review::with(['travel', 'author', 'recipient'])
            ->where('reviewer_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($reviews);
    }

    public function store(Request $request)
    {
        $request->validate([
            'travel_id'   => 'required|exists:travels,id',
            'reviewee_id' => 'required|exists:users,id',
            'rating'      => 'required|integer|min:1|max:5',
            'comment'     => 'nullable|string|max:500',
        ]);

        $exists = Review::where('travel_id', $request->travel_id)
            ->where('reviewer_id', Auth::id())
            ->where('reviewee_id', $request->reviewee_id)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Ya has valorado a este usuario en este viaje'], 400);
        }

        $review = Review::create([
            'travel_id'   => $request->travel_id,
            'reviewer_id' => Auth::id(),
            'reviewee_id' => $request->reviewee_id,
            'rating'      => $request->rating,
            'comment'     => $request->comment,
        ]);

        return response()->json([
            'message' => 'Valoración creada correctamente',
            'data'    => $review->load(['travel', 'author', 'recipient']),
        ], 201);
    }

    public function show($id)
    {
        $review = Review::with(['travel', 'author', 'recipient'])->findOrFail($id);
        return response()->json($review);
    }

    public function destroy($id)
    {
        $review = Review::findOrFail($id);

        if ($review->reviewer_id !== Auth::id()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $review->delete();
        return response()->json(['message' => 'Valoración eliminada correctamente']);
    }

    public function index(Request $request)
    {
        $sortable = ['rating', 'created_at', 'reviewer_id', 'reviewee_id'];
        $sort = in_array($request->sort, $sortable) ? $request->sort : 'created_at';
        $dir = $request->dir === 'desc' ? 'desc' : 'asc';
        $search = $request->search;

        $reviews = Review::with(['travel', 'author', 'recipient'])
            ->when($search, fn($q) => $q->where('comment', 'like', "%$search%"))
            ->orderBy($sort, $dir)
            ->paginate(20)
            ->withQueryString();

        return response()->json($reviews);
    }

    public function adminDestroy($id)
    {
        Review::findOrFail($id)->delete();
        return response()->json(['message' => 'Valoración eliminada correctamente']);
    }
}
