<?php

namespace App\Http\Controllers;

use App\Models\Calendar;
use Illuminate\Http\Request;

class CalendarController extends Controller
{
    public function index(Request $request)
    {
        $sortable = ['service_id', 'start_date', 'end_date',
            'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        $sort= in_array($request->sort, $sortable) ? $request->sort : 'service_id';
        $dir= $request->dir === 'desc' ? 'desc' : 'asc';
        $search= $request->search;

        $calendars = Calendar::query()
            ->when($search, fn($q) => $q
                ->where('service_id',  'like', "%$search%")
                ->orWhere('start_date', 'like', "%$search%")
                ->orWhere('end_date',   'like', "%$search%")
            )
            ->orderBy($sort, $dir)
            ->paginate(15)
            ->withQueryString();

        return view('calendar.index', compact('calendars', 'sort', 'dir', 'search'));
    }

    public function show(string $id)
    {
        $calendar = Calendar::findOrFail($id);
        return view('calendar.show', compact('calendar'));
    }

    public function create()
    {
        return view('calendar.create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'service_id' => 'required|string|max:50|unique:gtfs.calendar,service_id',
            'monday'=> 'required|boolean',
            'tuesday'=> 'required|boolean',
            'wednesday'=> 'required|boolean',
            'thursday'=> 'required|boolean',
            'friday'=> 'required|boolean',
            'saturday'=> 'required|boolean',
            'sunday'=> 'required|boolean',
            'start_date' => 'required|string|max:12',
            'end_date'=> 'required|string|max:12',
        ]);

        Calendar::create($request->all());

        return redirect()->route('calendar.index')->with('success', 'Calendario creado correctamente.');
    }

    public function edit(string $id)
    {
        $calendar = Calendar::findOrFail($id);
        return view('calendar.edit', compact('calendar'));
    }

    public function update(Request $request, string $id)
    {
        $request->validate([
            'monday'=> 'required|boolean',
            'tuesday'=> 'required|boolean',
            'wednesday'=> 'required|boolean',
            'thursday'=> 'required|boolean',
            'friday'=> 'required|boolean',
            'saturday'=> 'required|boolean',
            'sunday'=> 'required|boolean',
            'start_date' => 'required|string|max:12',
            'end_date'=> 'required|string|max:12',
        ]);

        $calendar = Calendar::findOrFail($id);
        $calendar->update($request->all());

        return redirect()->route('calendar.index')->with('success', 'Calendario actualizado correctamente.');
    }

    public function destroy(string $id)
    {
        $calendar = Calendar::findOrFail($id);
        $calendar->delete();

        return redirect()->route('calendar.index')->with('success', 'Calendario eliminado correctamente.');
    }
}
