<?php
namespace App\Http\Controllers;

use App\Models\Calendar;
use Illuminate\Http\Request;

class CalendarController extends Controller
{
    public function index(Request $request)
    {
        $sortable = ['service_id','start_date','end_date','monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
        $sort = in_array($request->sort, $sortable) ? $request->sort : 'service_id';
        $dir  = $request->dir === 'desc' ? 'desc' : 'asc';

        $calendars = Calendar::query()
            ->when($request->search, fn($q) => $q
                ->where('service_id',  'like', "%{$request->search}%")
                ->orWhere('start_date','like', "%{$request->search}%")
                ->orWhere('end_date',  'like', "%{$request->search}%")
            )
            ->orderBy($sort, $dir)
            ->paginate(15)
            ->withQueryString();

        return response()->json($calendars);
    }

    public function show(string $id)
    {
        return response()->json(Calendar::findOrFail($id));
    }

    public function store(Request $request)
    {
        $request->validate([
            'service_id' => 'required|string|max:50|unique:gtfs.calendar,service_id',
            'monday'     => 'required|boolean',
            'tuesday'    => 'required|boolean',
            'wednesday'  => 'required|boolean',
            'thursday'   => 'required|boolean',
            'friday'     => 'required|boolean',
            'saturday'   => 'required|boolean',
            'sunday'     => 'required|boolean',
            'start_date' => 'required|string|max:12',
            'end_date'   => 'required|string|max:12',
        ]);

        $calendar = Calendar::create($request->all());
        return response()->json(['message' => 'Calendario creado correctamente', 'data' => $calendar], 201);
    }

    public function update(Request $request, string $id)
    {
        $request->validate([
            'monday'     => 'required|boolean',
            'tuesday'    => 'required|boolean',
            'wednesday'  => 'required|boolean',
            'thursday'   => 'required|boolean',
            'friday'     => 'required|boolean',
            'saturday'   => 'required|boolean',
            'sunday'     => 'required|boolean',
            'start_date' => 'required|string|max:12',
            'end_date'   => 'required|string|max:12',
        ]);

        $calendar = Calendar::findOrFail($id);
        $calendar->update($request->all());
        return response()->json(['message' => 'Calendario actualizado correctamente', 'data' => $calendar]);
    }

    public function destroy(string $id)
    {
        Calendar::findOrFail($id)->delete();
        return response()->json(['message' => 'Calendario eliminado correctamente']);
    }
}
