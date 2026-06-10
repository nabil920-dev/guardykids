<?php

namespace App\Http\Controllers;

use App\Models\Nursery;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function dashboard()
    {
        return response()->json([
            'total_users'        => User::where('role', '!=', 'admin')->count(),
            'total_parents'      => User::where('role', 'parent')->count(),
            'total_owners'       => User::where('role', 'nursery_owner')->count(),
            'total_nurseries'    => Nursery::count(),
            'total_reservations' => Reservation::count(),
            'pending_reservations' => Reservation::where('status', 'pending')->count(),
        ]);
    }

    public function users()
    {
        $users = User::where('role', '!=', 'admin')
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($users);
    }

    public function deleteUser(User $user)
    {
        if ($user->isAdmin()) {
            return response()->json(['message' => 'Cannot delete admin.'], 403);
        }
        $user->delete();
        return response()->json(['message' => 'User deleted.']);
    }

    public function nurseries()
    {
        $nurseries = Nursery::with('owner:id,first_name,last_name,email')
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($nurseries);
    }

    public function updateNursery(Request $request, Nursery $nursery)
    {
        $validated = $request->validate([
            'name'         => 'sometimes|string|max:150',
            'description'  => 'nullable|string',
            'address'      => 'sometimes|string',
            'city'         => 'sometimes|string|max:100',
            'neighborhood' => 'sometimes|string|max:100',
            'capacity'     => 'sometimes|integer|min:1',
            'hourly_price' => 'sometimes|numeric|min:0',
            'opening_time' => 'sometimes|date_format:H:i,H:i:s',
            'closing_time' => 'sometimes|date_format:H:i,H:i:s',
        ]);
        $nursery->update($validated);
        return response()->json($nursery->fresh('owner:id,first_name,last_name'));
    }

    public function deleteNursery(Nursery $nursery)
    {
        $nursery->delete();
        return response()->json(['message' => 'Nursery deleted.']);
    }

    public function reservations()
    {
        $reservations = Reservation::with(['nursery', 'child', 'parent:id,first_name,last_name,email'])
            ->orderByDesc('reservation_date')
            ->get();
        return response()->json($reservations);
    }
}
