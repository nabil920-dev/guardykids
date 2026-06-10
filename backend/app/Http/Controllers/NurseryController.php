<?php

namespace App\Http\Controllers;

use App\Models\Nursery;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class NurseryController extends Controller
{
    public function index(Request $request)
    {
        $query = Nursery::with('owner:id,first_name,last_name,email,phone');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('neighborhood', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%");
            });
        }

        if ($request->filled('city')) {
            $query->where('city', $request->city);
        }

        if ($request->filled('neighborhood')) {
            $query->where('neighborhood', $request->neighborhood);
        }

        return response()->json($query->orderBy('name')->get());
    }

    public function show(Nursery $nursery)
    {
        $nursery->load('owner:id,first_name,last_name,email,phone');
        return response()->json($nursery);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'         => 'required|string|max:150',
            'description'  => 'nullable|string',
            'address'      => 'required|string',
            'city'         => 'required|string|max:100',
            'neighborhood' => 'required|string|max:100',
            'latitude'     => 'nullable|numeric',
            'longitude'    => 'nullable|numeric',
            'capacity'     => 'required|integer|min:1',
            'hourly_price' => 'required|numeric|min:0',
            'opening_time' => 'required|date_format:H:i',
            'closing_time' => 'required|date_format:H:i|after:opening_time',
            'image'        => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('nurseries', 'public');
        }

        $validated['owner_id'] = $request->user()->id;

        $nursery = Nursery::create($validated);
        $nursery->load('owner:id,first_name,last_name');

        return response()->json($nursery, 201);
    }

    public function update(Request $request, Nursery $nursery)
    {
        $this->authorizeNurseryOwner($request, $nursery);

        $validated = $request->validate([
            'name'         => 'sometimes|string|max:150',
            'description'  => 'nullable|string',
            'address'      => 'sometimes|string',
            'city'         => 'sometimes|string|max:100',
            'neighborhood' => 'sometimes|string|max:100',
            'latitude'     => 'nullable|numeric',
            'longitude'    => 'nullable|numeric',
            'capacity'     => 'sometimes|integer|min:1',
            'hourly_price' => 'sometimes|numeric|min:0',
            'opening_time' => 'sometimes|date_format:H:i,H:i:s',
            'closing_time' => 'sometimes|date_format:H:i,H:i:s',
            'image'        => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image')) {
            if ($nursery->image) {
                Storage::disk('public')->delete($nursery->image);
            }
            $validated['image'] = $request->file('image')->store('nurseries', 'public');
        }

        $nursery->update($validated);

        return response()->json($nursery->fresh('owner:id,first_name,last_name'));
    }

    public function destroy(Request $request, Nursery $nursery)
    {
        $user = $request->user();
        if (!$user->isAdmin() && $nursery->owner_id !== $user->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        if ($nursery->image) {
            Storage::disk('public')->delete($nursery->image);
        }

        $nursery->delete();

        return response()->json(['message' => 'Nursery deleted.']);
    }

    public function myNurseries(Request $request)
    {
        $nurseries = Nursery::where('owner_id', $request->user()->id)->get();
        return response()->json($nurseries);
    }

    private function authorizeNurseryOwner(Request $request, Nursery $nursery): void
    {
        $user = $request->user();
        if (!$user->isAdmin() && $nursery->owner_id !== $user->id) {
            abort(403, 'Forbidden.');
        }
    }
}
