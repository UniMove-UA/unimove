<?php

namespace App\Http\Controllers;

use App\Models\Agency;
use Illuminate\Http\Request;

class AgencyController extends Controller
{
    public function index(Request $request)
    {
        $sortable = ['agency_id', 'agency_name', 'agency_timezone', 'agency_lang'];
        $sort= in_array($request->sort, $sortable) ? $request->sort : 'agency_id';
        $dir= $request->dir === 'desc' ? 'desc' : 'asc';
        $search= $request->search;

        $agencies = Agency::query()
            ->when($search, fn($q) => $q
                ->where('agency_id',   'like', "%$search%")
                ->orWhere('agency_name', 'like', "%$search%")
                ->orWhere('agency_timezone', 'like', "%$search%")
                ->orWhere('agency_lang', 'like', "%$search%")
            )
            ->orderBy($sort, $dir)
            ->paginate(15)
            ->withQueryString();

        return view('agency.index', compact('agencies', 'sort', 'dir', 'search'));
    }

    public function show(string $id)
    {
        $agency = Agency::findOrFail($id);
        return view('agency.show', compact('agency'));
    }

    public function create()
    {
        return view('agency.create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'agency_id'=> 'required|string|max:50|unique:gtfs.agency,agency_id',
            'agency_name'=> 'required|string',
            'agency_url'=> 'required|string',
            'agency_timezone' => 'required|string|max:50',
            'agency_lang'=> 'nullable|string|max:10',
            'agency_phone'=> 'nullable|string|max:50',
            'agency_fare_url' => 'nullable|string',
            'agency_email'=> 'nullable|email',
        ]);

        Agency::create($request->all());

        return redirect()->route('agency.index')->with('success', 'Agencia creada correctamente.');
    }

    public function edit(string $id)
    {
        $agency = Agency::findOrFail($id);
        return view('agency.edit', compact('agency'));
    }

    public function update(Request $request, string $id)
    {
        $request->validate([
            'agency_name'=> 'required|string',
            'agency_url'=> 'required|string',
            'agency_timezone' => 'required|string|max:50',
            'agency_lang'=> 'nullable|string|max:10',
            'agency_phone'=> 'nullable|string|max:50',
            'agency_fare_url' => 'nullable|string',
            'agency_email'=> 'nullable|email',
        ]);

        $agency = Agency::findOrFail($id);
        $agency->update($request->all());

        return redirect()->route('agency.index')->with('success', 'Agencia actualizada correctamente.');
    }

    public function destroy(string $id)
    {
        $agency = Agency::findOrFail($id);
        $agency->delete();

        return redirect()->route('agency.index')->with('success', 'Agencia eliminada correctamente.');
    }
}
