<?php

namespace App\Http\Controllers;

use App\Models\Route;
use App\Models\Agency;
use Illuminate\Http\Request;

class RouteController extends Controller
{
    public function index(Request $request)
    {
        $sortable = ['route_id', 'agency_id', 'route_short_name', 'route_long_name', 'route_type'];
        $sort= in_array($request->sort, $sortable) ? $request->sort : 'route_id';
        $dir= $request->dir === 'desc' ? 'desc' : 'asc';
        $search= $request->search;

        $routes = Route::with('agencia')
            ->when($search, fn($q) => $q
                ->where('route_id',         'like', "%$search%")
                ->orWhere('route_short_name', 'like', "%$search%")
                ->orWhere('route_long_name',  'like', "%$search%")
                ->orWhere('agency_id',        'like', "%$search%")
            )
            ->orderBy($sort, $dir)
            ->paginate(20)
            ->withQueryString();

        return view('route.index', compact('routes', 'sort', 'dir', 'search'));
    }

    public function show(string $id)
    {
        $route = Route::with('agencia')->findOrFail($id);
        return view('route.show', compact('route'));
    }

    public function create()
    {
        $agencies = Agency::orderBy('agency_name')->get();
        return view('route.create', compact('agencies'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'route_id'=> 'required|string|max:50|unique:gtfs.routes,route_id',
            'agency_id'=> 'nullable|string|max:50|exists:gtfs.agency,agency_id',
            'route_short_name' => 'nullable|string|max:100',
            'route_long_name'  => 'nullable|string|max:255',
            'route_type'=> 'required|integer',
            'route_url'=> 'nullable|string',
            'route_color'=> 'nullable|string|max:10',
            'route_text_color' => 'nullable|string|max:10',
        ]);

        Route::create($request->all());

        return redirect()->route('route.index')->with('success', 'Ruta creada correctamente.');
    }

    public function edit(string $id)
    {
        $route= Route::findOrFail($id);
        $agencies = Agency::orderBy('agency_name')->get();
        return view('route.edit', compact('route', 'agencies'));
    }

    public function update(Request $request, string $id)
    {
        $request->validate([
            'agency_id'=> 'nullable|string|max:50|exists:gtfs.agency,agency_id',
            'route_short_name' => 'nullable|string|max:100',
            'route_long_name'  => 'nullable|string|max:255',
            'route_type'=> 'required|integer',
            'route_url'=> 'nullable|string',
            'route_color'=> 'nullable|string|max:10',
            'route_text_color' => 'nullable|string|max:10',
        ]);

        $route = Route::findOrFail($id);
        $route->update($request->all());

        return redirect()->route('route.index')->with('success', 'Ruta actualizada correctamente.');
    }

    public function destroy(string $id)
    {
        $route = Route::findOrFail($id);
        $route->delete();

        return redirect()->route('route.index')->with('success', 'Ruta eliminada correctamente.');
    }
}
