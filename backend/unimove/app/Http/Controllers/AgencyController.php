<?php
namespace App\Http\Controllers;

use App\Models\Agency;
use Illuminate\Http\Request;

class AgencyController extends Controller
{
    public function index(Request $request)
    {
        $sortable = ['agency_id', 'agency_name', 'agency_timezone', 'agency_lang'];
        $sort = in_array($request->sort, $sortable) ? $request->sort : 'agency_id';
        $dir  = $request->dir === 'desc' ? 'desc' : 'asc';

        $agencies = Agency::query()
            ->when($request->search, fn($q) => $q
                ->where('agency_id',       'like', "%{$request->search}%")
                ->orWhere('agency_name',   'like', "%{$request->search}%")
                ->orWhere('agency_timezone','like', "%{$request->search}%")
                ->orWhere('agency_lang',   'like', "%{$request->search}%")
            )
            ->orderBy($sort, $dir)
            ->paginate(15)
            ->withQueryString();

        return response()->json($agencies);
    }

    public function show(string $id)
    {
        return response()->json(Agency::findOrFail($id));
    }

    public function store(Request $request)
    {
        $request->validate([
            'agency_id'       => 'required|string|max:50|unique:gtfs.agency,agency_id',
            'agency_name'     => 'required|string',
            'agency_url'      => 'required|string',
            'agency_timezone' => 'required|string|max:50',
            'agency_lang'     => 'nullable|string|max:10',
            'agency_phone'    => 'nullable|string|max:50',
            'agency_fare_url' => 'nullable|string',
            'agency_email'    => 'nullable|email',
        ]);

        $agency = Agency::create($request->all());

        return response()->json(['message' => 'Agencia creada correctamente', 'data' => $agency], 201);
    }

    public function update(Request $request, string $id)
    {
        $request->validate([
            'agency_name'     => 'required|string',
            'agency_url'      => 'required|string',
            'agency_timezone' => 'required|string|max:50',
            'agency_lang'     => 'nullable|string|max:10',
            'agency_phone'    => 'nullable|string|max:50',
            'agency_fare_url' => 'nullable|string',
            'agency_email'    => 'nullable|email',
        ]);

        $agency = Agency::findOrFail($id);
        $agency->update($request->all());

        return response()->json(['message' => 'Agencia actualizada correctamente', 'data' => $agency]);
    }

    public function destroy(string $id)
    {
        Agency::findOrFail($id)->delete();
        return response()->json(['message' => 'Agencia eliminada correctamente']);
    }
}
