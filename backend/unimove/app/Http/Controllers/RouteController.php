<?php
namespace App\Http\Controllers;

use App\Models\Route;
use Illuminate\Http\Request;

class RouteController extends Controller
{
    public function index(Request $request)
    {
        $sortable = ['route_id','agency_id','route_short_name','route_long_name','route_type'];
        $sort = in_array($request->sort, $sortable) ? $request->sort : 'route_id';
        $dir  = $request->dir === 'desc' ? 'desc' : 'asc';

        $routes = Route::with('agencia')
            ->when($request->search, fn($q) => $q
                ->where('route_id',          'like', "%{$request->search}%")
                ->orWhere('route_short_name','like', "%{$request->search}%")
                ->orWhere('route_long_name', 'like', "%{$request->search}%")
                ->orWhere('agency_id',       'like', "%{$request->search}%")
            )
            ->orderBy($sort, $dir)
            ->paginate(20)
            ->withQueryString();

        return response()->json($routes);
    }

    public function show(string $id)
    {
        return response()->json(Route::with('agencia')->findOrFail($id));
    }

    public function store(Request $request)
    {
        $request->validate([
            'route_id'         => 'required|string|max:50|unique:gtfs.routes,route_id',
            'agency_id'        => 'nullable|string|max:50|exists:gtfs.agency,agency_id',
            'route_short_name' => 'nullable|string|max:100',
            'route_long_name'  => 'nullable|string|max:255',
            'route_type'       => 'required|integer',
            'route_url'        => 'nullable|string',
            'route_color'      => 'nullable|string|max:10',
            'route_text_color' => 'nullable|string|max:10',
        ]);

        $route = Route::create($request->all());
        return response()->json(['message' => 'Ruta creada correctamente', 'data' => $route], 201);
    }

    public function update(Request $request, string $id)
    {
        $request->validate([
            'agency_id'        => 'nullable|string|max:50|exists:gtfs.agency,agency_id',
            'route_short_name' => 'nullable|string|max:100',
            'route_long_name'  => 'nullable|string|max:255',
            'route_type'       => 'required|integer',
            'route_url'        => 'nullable|string',
            'route_color'      => 'nullable|string|max:10',
            'route_text_color' => 'nullable|string|max:10',
        ]);

        $route = Route::findOrFail($id);
        $route->update($request->all());

        return response()->json(['message' => 'Ruta actualizada correctamente', 'data' => $route]);
    }

    public function destroy(string $id)
    {
        Route::findOrFail($id)->delete();
        return response()->json(['message' => 'Ruta eliminada correctamente']);
    }
}
