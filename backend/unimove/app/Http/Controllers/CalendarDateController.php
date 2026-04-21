<?php

namespace App\Http\Controllers;

use App\Models\CalendarDate;
use App\Models\Calendar;
use Illuminate\Http\Request;

class CalendarDateController extends Controller
{
    public function index()
    {
        $calendarDates = CalendarDate::with('calendario')->get();
        return view('calendar_date.index', compact('calendarDates'));
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
        $calendars = Calendar::all();
        return view('calendar_date.create', compact('calendars'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'service_id'     => 'required|string|max:50|exists:gtfs.calendar,service_id',
            'date'           => 'required|string|max:12',
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
        $calendars = Calendar::all();
        return view('calendar_date.edit', compact('calendarDate', 'calendars'));
    }

    public function update(Request $request)
    {
        $request->validate([
            'service_id'     => 'required|string|max:50|exists:gtfs.calendar,service_id',
            'date'           => 'required|string|max:12',
            'exception_type' => 'required|integer|in:1,2',
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
