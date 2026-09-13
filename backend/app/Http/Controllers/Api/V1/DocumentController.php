<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\DocumentKind;
use App\Http\Controllers\Controller;
use App\Http\Resources\DocumentResource;
use App\Models\Document;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class DocumentController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        return DocumentResource::collection(
            $request->user()->documents()->latest()->get(),
        );
    }

    /** رفع مستند جديد */
    public function store(Request $request): DocumentResource
    {
        $maxKilobytes = (int) (config('menhity.uploads.max_bytes') / 1024);
        $mimes = implode(',', config('menhity.uploads.mimes'));

        $validated = $request->validate([
            'file' => ['required', 'file', "max:{$maxKilobytes}", "mimes:{$mimes}"],
            'kind' => ['required', Rule::enum(DocumentKind::class)],
        ]);

        $file = $validated['file'];

        // اسم مخزّن عشوائي يمنع تضارب الأسماء وتجاوز المسار
        $path = $file->store('documents', 'public');

        $document = $request->user()->documents()->create([
            'kind' => $validated['kind'],
            'original_name' => $file->getClientOriginalName(),
            'stored_name' => basename($path),
            'mime_type' => $file->getClientMimeType(),
            'size_bytes' => $file->getSize(),
            'path' => $path,
        ]);

        return new DocumentResource($document);
    }

    /** حذف مستند */
    public function destroy(Request $request, Document $document): JsonResponse
    {
        abort_unless($document->user_id === $request->user()->id, 403);

        Storage::disk('public')->delete($document->path);
        $document->delete();

        return response()->json(['message' => 'تم حذف المستند.']);
    }
}
