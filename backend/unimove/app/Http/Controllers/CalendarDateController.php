<?php

namespace App\Http\Controllers;

use App\Models\CalendarDate;
use App\Models\Calendar;
use Illuminate\Http\Request;

class CalendarDateController extends Controller
{
    public function index(Request $request)
    {
        $sortable = ['service_id', 'date', 'exception_type'];
        $sort= in_array($request->sort, $sortable) ? $request->sort : 'date';
        $dir= $request->dir === 'desc' ? 'desc' : 'asc';
        $search= $request->search;

        $calendarDates = CalendarDate::with('calendario')
            ->when($search, fn($q) => $q
                ->where('service_id',     'like', "%$search%")
                ->orWhere('date',          'like', "%$search%")
                ->orWhere('exception_type', '=',    $search)
            )
            ->orderBy($sort, $dir)
            ->paginate(20)
            ->withQueryString();

        return view('calendar_date.index', compact('calendarDates', 'sort', 'dir', 'search'));
    }

    public function show(Request $request)
    {
        $calendarDate = CalendarDate::where('service_id', $request->service_id)
            ->where('date', $request->date)
            ->firstOrFail();
        return view('calendar_date.show', compact('calendarDate'));
    }

    public function create()
    {
        $calendars = Calendar::orderBy('service_id')->get();
        return view('calendar_date.create', compact('calendars'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'service_id'=> 'required|string|max:50|exists:gtfs.calendar,service_id',
            'date'=> 'required|string|max:12',
            'exception_type' => 'required|integer|in:1,2',
        ]);

        CalendarDate::create($request->all());

        return redirect()->route('calendar-date.index')->with('success', 'Excepción creada correctamente.');
    }

    public function edit(Request $request)
    {
        $calendarDate = CalendarDate::where('service_id', $request->service_id)
            ->where('date', $request->date)
            ->firstOrFail();
        $calendars = Calendar::orderBy('service_id')->get();
        return view('calendar_date.edit', compact('calendarDate', 'calendars'));
    }

    public function update(Request $request)
    {
        $request->validate([
            'service_id'=> 'required|string|max:50|exists:gtfs.calendar,service_id',
            'date'=> 'required|string|max:12',
            'exception_type'=> 'required|integer|in:1,2',
        ]);

        $calendarDate = CalendarDate::where('service_id', $request->service_id)
            ->where('date', $request->date)
            ->firstOrFail();
        $calendarDate->update($request->all());

        return redirect()->route('calendar-date.index')->with('success', 'Excepción actualizada correctamente.');
    }

    public function destroy(Request $request)
    {
        CalendarDate::where('service_id', $request->service_id)
            ->where('date', $request->date)
            ->delete();

        return redirect()->route('calendar-date.index')->with('success', 'Excepción eliminada correctamente.');
    }
}
