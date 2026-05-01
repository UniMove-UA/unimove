<?php
namespace App\Http\Controllers;

use App\Models\Shape;
use Illuminate\Http\Request;

class ShapeController extends Controller
{
    public function index(Request $request)
    {
        $sortable = ['shape_id','shape_pt_sequence','shape_pt_lat','shape_pt_lon','shape_dist_traveled'];
        $sort = in_array($request->sort, $sortable) ? $request->sort : 'shape_id';
        $dir  = $request->dir === 'desc' ? 'desc' : 'asc';

        $shapes = Shape::query()
            ->when($request->search, fn($q) => $q->where('shape_id','like',"%{$request->search}%"))
            ->orderBy($sort, $dir)
            ->paginate(25)
            ->withQueryString();

        return response()->json($shapes);
    }

    public function show(Request $request)
    {
        $shapes = Shape::where('shape_id', $request->shape_id)
            ->orderBy('shape_pt_sequence')
            ->get();

        return response()->json($shapes);
    }

    public function store(Request $request)
    {
        $request->validate([
            'shape_id'            => 'required|string|max:50',
            'shape_pt_lat'        => 'required|numeric|between:-90,90',
            'shape_pt_lon'        => 'required|numeric|between:-180,180',
            'shape_pt_sequence'   => 'required|integer',
            'shape_dist_traveled' => 'nullable|numeric',
        ]);

        $shape = Shape::create($request->all());
        return response()->json(['message' => 'Punto creado correctamente', 'data' => $shape], 201);
    }

    public function update(Request $request)
    {
        $request->validate([
            'shape_pt_lat'        => 'required|numeric|between:-90,90',
            'shape_pt_lon'        => 'required|numeric|between:-180,180',
            'shape_pt_sequence'   => 'required|integer',
            'shape_dist_traveled' => 'nullable|numeric',
        ]);

        $shape = Shape::where('shape_id', $request->shape_id)
            ->where('shape_pt_sequence', $request->shape_pt_sequence)
            ->firstOrFail();
        $shape->update($request->all());

        return response()->json(['message' => 'Punto actualizado correctamente', 'data' => $shape]);
    }

    public function destroy(Request $request)
    {
        Shape::where('shape_id', $request->shape_id)
            ->where('shape_pt_sequence', $request->shape_pt_sequence)
            ->delete();

        return response()->json(['message' => 'Punto eliminado correctamente']);
    }
}
