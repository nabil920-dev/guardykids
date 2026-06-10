<?php

namespace App\Http\Controllers;

use App\Models\Nursery;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ReservationController extends Controller
{
    public function index(Request $request)
    {
        $user  = $request->user();
        $query = Reservation::with(['nursery', 'child', 'parent:id,first_name,last_name,email,phone']);

        if ($user->isParent()) {
            $query->where('parent_id', $user->id);
        } elseif ($user->isNurseryOwner()) {
            $nurseryIds = $user->nurseries()->pluck('id');
            $query->whereIn('nursery_id', $nurseryIds);
        }

        return response()->json($query->orderByDesc('reservation_date')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nursery_id'       => 'required|exists:nurseries,id',
            'child_id'         => 'required|exists:children,id',
            'reservation_date' => 'required|date|after_or_equal:today',
            'start_time'       => 'required|date_format:H:i',
            'end_time'         => 'required|date_format:H:i|after:start_time',
        ]);

        $nursery = Nursery::findOrFail($validated['nursery_id']);

        $start    = \Carbon\Carbon::createFromFormat('H:i', $validated['start_time']);
        $end      = \Carbon\Carbon::createFromFormat('H:i', $validated['end_time']);
        // true = absolute value, so the duration is always positive
        // (validation already guarantees end_time is after start_time).
        $duration = round($start->diffInMinutes($end, true) / 60, 2);
        $price    = round($duration * $nursery->hourly_price, 2);

        $reservation = Reservation::create([
            'parent_id'         => $request->user()->id,
            'nursery_id'        => $validated['nursery_id'],
            'child_id'          => $validated['child_id'],
            'reservation_date'  => $validated['reservation_date'],
            'start_time'        => $validated['start_time'],
            'end_time'          => $validated['end_time'],
            'duration_hours'    => $duration,
            'total_price'       => $price,
            'status'            => 'pending',
            'payment_status'    => 'paid',
            'payment_reference' => 'GK-' . strtoupper(Str::random(10)),
        ]);

        $reservation->load(['nursery', 'child']);

        return response()->json($reservation, 201);
    }

    public function show(Request $request, Reservation $reservation)
    {
        $this->authorizeAccess($request, $reservation);
        $reservation->load(['nursery', 'child', 'parent:id,first_name,last_name,email,phone']);

        return response()->json($reservation);
    }

    public function update(Request $request, Reservation $reservation)
    {
        $user = $request->user();

        if ($user->isNurseryOwner()) {
            $request->validate(['status' => 'required|in:confirmed,rejected']);
            $reservation->update(['status' => $request->status]);
        } elseif ($user->isParent() && $reservation->parent_id === $user->id) {
            $request->validate(['status' => 'required|in:cancelled']);
            $reservation->update(['status' => 'cancelled']);
        } elseif ($user->isAdmin()) {
            $request->validate(['status' => 'required|in:confirmed,rejected,cancelled,pending']);
            $reservation->update(['status' => $request->status]);
        } else {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        return response()->json($reservation->fresh(['nursery', 'child']));
    }

    public function destroy(Request $request, Reservation $reservation)
    {
        $user = $request->user();
        if (!$user->isAdmin() && $reservation->parent_id !== $user->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $reservation->delete();
        return response()->json(['message' => 'Reservation deleted.']);
    }

    private function authorizeAccess(Request $request, Reservation $reservation): void
    {
        $user = $request->user();
        if ($user->isAdmin()) {
            return;
        }
        if ($user->isParent() && $reservation->parent_id === $user->id) {
            return;
        }
        if ($user->isNurseryOwner()) {
            $owns = $user->nurseries()->where('id', $reservation->nursery_id)->exists();
            if ($owns) return;
        }
        abort(403, 'Forbidden.');
    }
}
