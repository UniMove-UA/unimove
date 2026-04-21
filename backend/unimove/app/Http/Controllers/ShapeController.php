<?php

namespace App\Http\Controllers;

use App\Models\Shape;
use Illuminate\Http\Request;

class ShapeController extends Controller
{
    public function index()
    {
        $shapes = Shape::all();
        return view('shape.index', compact('shapes'));
    }

    public function show(Request $request)
    {
        $shapes = Shape::where('shape_id', $request->shape_id)
            ->orderBy('shape_pt_sequence')
            ->get();
        return view('shape.show', compact('shapes'));
    }

    public function create()
    {
        return view('shape.create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'shape_id'           => 'required|string|max:50',
            'shape_pt_lat'       => 'required|numeric|between:-90,90',
            'shape_pt_lon'       => 'required|numeric|between:-180,180',
            'shape_pt_sequence'  => 'required|integer',
            'shape_dist_traveled'=> 'nullable|numeric',
        ]);

        Shape::create($request->all());

        return redirect()->route('shape.index')->with('success', 'Punto de forma creado correctamente.');
    }

    public function edit(Request $request)
    {
        $shape = Shape::where('shape_id', $request->shape_id)
            ->where('shape_pt_sequence', $request->shape_pt_sequence)
            ->firstOrFail();
        return view('shape.edit', compact('shape'));
    }

    public function update(Request $request)
    {
        $request->validate([
            'shape_pt_lat'       => 'required|numeric|between:-90,90',
            'shape_pt_lon'       => 'required|numeric|between:-180,180',
            'shape_pt_sequence'  => 'required|integer',
            'shape_dist_traveled'=> 'nullable|numeric',
        ]);

        $shape = Shape::where('shape_id', $request->shape_id)
            ->where('shape_pt_sequence', $request->shape_pt_sequence)
            ->firstOrFail();
        $shape->update($request->all());

        return redirect()->route('shape.index')->with('success', 'Punto de forma actualizado correctamente.');
    }

    public function destroy(Request $request)
    {
        Shape::where('shape_id', $request->shape_id)
            ->where('shape_pt_sequence', $request->shape_pt_sequence)
            ->delete();

        return redirect()->route('shape.index')->with('success', 'Punto de forma eliminado correctamente.');
    }
}
