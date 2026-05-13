<?php
namespace App\Http\Controllers;

use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class VehicleController extends Controller
{
    public function myVehicles()
    {
        $vehicles = Vehicle::where('user_id', Auth::id())->get();
        return response()->json($vehicles);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'brand'       => 'required|string|max:255',
            'model'       => 'required|string|max:255',
            'plate' => 'required|string|max:20|unique:vehicles,plate|regex:/^\d{4}[A-Z]{3}$/',
            'total_seats' => 'required|integer|min:1|max:9',
        ]);

        if ($validator->fails()) {
            $errors = $validator->errors();

            if ($errors->has('plate')) {
                return response()->json([
                    'message' => 'Esta matrícula ya está registrada. Por favor, introduce otra diferente.',
                ], 422);
            }

            return response()->json([
                'message' => $errors->first(),
            ], 422);
        }

        $vehicle = Vehicle::create([
            'user_id'     => Auth::id(),
            'brand'       => $request->brand,
            'model'       => $request->model,
            'plate'       => strtoupper($request->plate),
            'total_seats' => $request->total_seats,
        ]);

        return response()->json([
            'message' => 'Vehículo añadido correctamente',
            'data'    => $vehicle,
        ], 201);
    }

    public function show($id)
    {
        $vehicle = Vehicle::findOrFail($id);

        if ($vehicle->user_id !== Auth::id()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        return response()->json($vehicle);
    }

    public function edit($id)
    {
        $vehicle = Vehicle::findOrFail($id);

        if ($vehicle->user_id !== Auth::id()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        return response()->json($vehicle);
    }

    public function update(Request $request, $id)
    {
        $vehicle = Vehicle::findOrFail($id);

        if ($vehicle->user_id !== Auth::id()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $validator = Validator::make($request->all(), [
            'brand'       => 'sometimes|string|max:255',
            'model'       => 'sometimes|string|max:255',
            'plate'       => ['sometimes', 'string', 'max:20', 'unique:vehicles,plate,' . $id, 'regex:/^\d{4}[A-Z]{3}$/'],
            'total_seats' => 'sometimes|integer|min:1|max:9',
        ]);

        if ($validator->fails()) {
            $errors = $validator->errors();

            if ($errors->has('plate')) {
                return response()->json([
                    'message' => 'Esta matrícula ya está registrada o tiene un formato inválido. Ej: 1234ABC',
                ], 422);
            }

            return response()->json(['message' => $errors->first()], 422);
        }

        if ($request->has('plate')) {
            $request->merge(['plate' => strtoupper($request->plate)]);
        }

        $vehicle->update($request->only(['brand', 'model', 'plate', 'total_seats']));

        return response()->json([
            'message' => 'Vehículo actualizado correctamente',
            'data'    => $vehicle,
        ]);
    }

    public function destroy($id)
    {
        $vehicle = Vehicle::findOrFail($id);

        if ($vehicle->user_id !== Auth::id()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $vehicle->delete();
        return response()->json(['message' => 'Vehículo eliminado correctamente']);
    }

    public function index(Request $request)
    {
        $sortable = ['brand', 'model', 'plate', 'total_seats', 'created_at'];
        $sort = in_array($request->sort, $sortable) ? $request->sort : 'created_at';
        $dir = $request->dir === 'desc' ? 'desc' : 'asc';
        $search = $request->search;

        $vehicles = Vehicle::with('owner')
            ->when($search, fn($q) => $q
                ->where('brand', 'like', "%$search%")
                ->orWhere('model', 'like', "%$search%")
                ->orWhere('plate', 'like', "%$search%")
            )
            ->orderBy($sort, $dir)
            ->paginate(20)
            ->withQueryString();

        return response()->json($vehicles);
    }
}
