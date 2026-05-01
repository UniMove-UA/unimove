<?php
namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MessageController extends Controller
{
    public function index(Request $request)
    {
        $sortable = ['created_at', 'emisor_id', 'receptor_id'];
        $sort = in_array($request->sort, $sortable) ? $request->sort : 'created_at';
        $dir = $request->dir === 'desc' ? 'desc' : 'asc';
        $search = $request->search;

        $messages = Message::with(['emisor', 'receptor'])
            ->when($search, fn($q) => $q->where('text', 'like', "%$search%"))
            ->orderBy($sort, $dir)
            ->paginate(20)
            ->withQueryString();

        return response()->json($messages);
    }

    public function show($id)
    {
        $message = Message::with(['emisor', 'receptor'])->findOrFail($id);
        return response()->json($message);
    }

    public function edit($id)
    {
        $message = Message::with(['emisor', 'receptor'])->findOrFail($id);
        return response()->json($message);
    }

    public function update(Request $request, $id)
    {
        $message = Message::findOrFail($id);

        $request->validate([
            'text' => 'required|string|max:1000',
            'url'  => 'nullable|url',
        ]);

        $message->update([
            'text' => $request->text,
            'url'  => $request->url,
        ]);

        return response()->json([
            'message' => 'Mensaje actualizado correctamente',
            'data'    => $message->load(['emisor', 'receptor']),
        ]);
    }

    public function destroy($id)
    {
        Message::findOrFail($id)->delete();
        return response()->json(['message' => 'Mensaje eliminado correctamente']);
    }

    // GET /chats/me
    public function myChats()
    {
        $userId = Auth::id();

        if (!$userId) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        //se sacan los usuarios con los que se tiene un chat
        $chats = Message::with(['emisor', 'receptor'])
            ->where('emisor_id', $userId)
            ->orWhere('receptor_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->groupBy(function ($message) use ($userId) {
                return $message->emisor_id === $userId
                    ? $message->receptor_id
                    : $message->emisor_id;
            })
            ->map(function ($messages, $otherUserId) {
                $otherUser = $messages->first()->emisor_id === $otherUserId
                    ? $messages->first()->emisor
                    : $messages->first()->receptor;

                return [
                    'name'=> $otherUser->name,
                    'username' =>$otherUser->username,
                    'image' => $otherUser->image,
                    'email'=> $otherUser->email,
                    'last_message' => $messages->first()->text,
                ];
            })
            ->values();

        return response()->json($chats);
    }

    // GET /chats/@{usuario}
    public function conversation($username)
    {
        $userId = Auth::id();

        if (!$userId) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $otherUser = User::where('username', $username)->firstOrFail();

        $messages = Message::where(function ($q) use ($userId, $otherUser) {
            $q->where('emisor_id', $userId)
                ->where('receptor_id', $otherUser->id);
        })
            ->orWhere(function ($q) use ($userId, $otherUser) {
                $q->where('emisor_id', $otherUser->id)
                    ->where('receptor_id', $userId);
            })
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(fn($m) => [
                'emisor' => $m->emisor->username,
                'text'   => $m->text,
                'url'    => $m->url,
                'mine'   => $m->emisor_id === $userId,
                'created_at' => $m->created_at,
            ]);

        return response()->json($messages);
    }

    //PUT /chats/@{usuario}
    public function sendMessage(Request $request, $username)
    {
        $userId = Auth::id();

        if (!$userId) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $request->validate([
            'message' => 'required|string|max:1000',
            'url'     => 'nullable|url',
        ]);

        $otherUser = User::where('username', $username)->firstOrFail();

        $message = Message::create([
            'emisor_id'   => $userId,
            'receptor_id' => $otherUser->id,
            'text'        => $request->message,
            'url'         => $request->url,
        ]);

        Notification::create([
            'user_id' => $otherUser->id,
            'text'    => $message->emisor->name . ' te ha enviado un mensaje',
            'read'    => false,
        ]);

        return response()->json([
            'message' => 'Mensaje enviado correctamente',
            'data'    => [
                'emisor' => $message->emisor->username,
                'text'   => $message->text,
                'url'    => $message->url,
                'mine'   => $message->emisor_id === $userId,
                'created_at' => $message->created_at,
            ],
        ], 201);
    }
}
