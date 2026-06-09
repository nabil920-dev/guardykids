<?php

namespace App\Http\Controllers;

use App\Models\Child;
use Illuminate\Http\Request;

class ChildController extends Controller
{
    public function index(Request $request)
    {
        $children = Child::where('parent_id', $request->user()->id)->get();
        return response()->json($children);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'  => 'required|string|max:100',
            'age'   => 'required|integer|min:0|max:12',
            'notes' => 'nullable|string',
        ]);

        $validated['parent_id'] = $request->user()->id;
        $child = Child::create($validated);

        return response()->json($child, 201);
    }

    public function show(Request $request, Child $child)
    {
        $this->authorizeParent($request, $child);
        return response()->json($child);
    }

    public function update(Request $request, Child $child)
    {
        $this->authorizeParent($request, $child);

        $validated = $request->validate([
            'name'  => 'sometimes|string|max:100',
            'age'   => 'sometimes|integer|min:0|max:12',
            'notes' => 'nullable|string',
        ]);

        $child->update($validated);

        return response()->json($child);
    }

    public function destroy(Request $request, Child $child)
    {
        $this->authorizeParent($request, $child);
        $child->delete();

        return response()->json(['message' => 'Child deleted.']);
    }

    private function authorizeParent(Request $request, Child $child): void
    {
        if ($child->parent_id !== $request->user()->id) {
            abort(403, 'Forbidden.');
        }
    }
}
