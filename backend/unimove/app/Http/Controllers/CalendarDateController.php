<?php
namespace App\Http\Controllers;

use App\Models\CalendarDate;
use Illuminate\Http\Request;

class CalendarDateController extends Controller
{
    public function index(Request $request)
    {
        $sortable = ['service_id', 'date', 'exception_type'];
        $sort = in_array($request->sort, $sortable) ? $request->sort : 'date';
        $dir  = $request->dir === 'desc' ? 'desc' : 'asc';

        $calendarDates = CalendarDate::query()
            ->when($request->search, fn($q) => $q
                ->where('service_id',     'like', "%{$request->search}%")
                ->orWhere('date',          'like', "%{$request->search}%")
                ->orWhere('exception_type','=',    $request->search)
            )
            ->orderBy($sort, $dir)
            ->paginate(20)
            ->withQueryString();

        return response()->json($calendarDates);
    }

    public function show(Request $request)
    {
        $calendarDate = CalendarDate::where('service_id', $request->service_id)
            ->where('date', $request->date)
            ->firstOrFail();

        return response()->json($calendarDate);
    }

    public function store(Request $request)
    {
        $request->validate([
            'service_id'     => 'required|string|max:50|exists:gtfs.calendar,service_id',
            'date'           => 'required|string|max:12',
            'exception_type' => 'required|integer|in:1,2',
        ]);

        $calendarDate = CalendarDate::create($request->all());
        return response()->json(['message' => 'Excepción creada correctamente', 'data' => $calendarDate], 201);
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

        return response()->json(['message' => 'Excepción actualizada correctamente', 'data' => $calendarDate]);
    }

    public function destroy(Request $request)
    {
        CalendarDate::where('service_id', $request->service_id)
            ->where('date', $request->date)
            ->delete();

        return response()->json(['message' => 'Excepción eliminada correctamente']);
    }
}
