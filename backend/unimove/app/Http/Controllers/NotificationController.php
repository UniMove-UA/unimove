<?php
namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    // GET /notifications
    public function myNotifications()
    {
        $userId = Auth::id();

        if (!$userId) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $notifications = Notification::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($n) => [
                'id' => $n->id,
                'text' => $n->text,
                'read' => $n->read,
                'date' => $n->created_at->format('d/m/Y H:i'),
            ]);

        return response()->json($notifications);
    }

    public function index(Request $request)
    {
        $sortable = ['created_at', 'read', 'user_id'];
        $sort = in_array($request->sort, $sortable) ? $request->sort : 'created_at';
        $dir = $request->dir === 'desc' ? 'desc' : 'asc';
        $search = $request->search;

        $notifications = Notification::with('user')
            ->when($search, fn($q) => $q->where('text', 'like', "%$search%"))
            ->orderBy($sort, $dir)
            ->paginate(20)
            ->withQueryString();

        return response()->json($notifications);
    }

    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'text'    => 'required|string|max:500',
        ]);

        $notification = Notification::create([
            'user_id' => $request->user_id,
            'text'    => $request->text,
            'read'    => false,
        ]);

        return response()->json([
            'message' => 'Notificación creada correctamente',
            'data'    => $notification,
        ], 201);
    }

    public function show($id)
    {
        $notification = Notification::with('user')->findOrFail($id);
        return response()->json($notification);
    }

    public function destroy($id)
    {
        Notification::findOrFail($id)->delete();
        return response()->json(['message' => 'Notificación eliminada correctamente']);
    }

    public function markAllRead(Request $request)
    {
        $userId = Auth::id();

        if (!$userId) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        Notification::where('user_id', $userId)
            ->where('read', false)
            ->update(['read' => true]);

        return response()->json(['message' => 'Notificaciones marcadas como leídas']);
    }

    public function markRead($id)
    {
        $userId = Auth::id();

        if (!$userId) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $notification = Notification::findOrFail($id);

        if ($notification->user_id !== $userId) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $notification->update(['read' => true]);

        return response()->json(['message' => 'Notificación marcada como leída']);
    }
}
