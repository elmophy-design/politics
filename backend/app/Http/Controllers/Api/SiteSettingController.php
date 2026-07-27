<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

/**
 * Admin-editable frontend content — homepage hero text/background, footer
 * social links, and payment badge toggles. Public GET so the frontend can
 * render real content in one request; writes are content-manager+ only.
 */
class SiteSettingController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        return $this->success(SiteSetting::map($request->string('group')->toString() ?: null));
    }

    /**
     * Bulk upsert — the admin settings page sends the whole group at once.
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'group' => ['required', 'string'],
            'values' => ['required', 'array'],
            'values.*' => ['nullable', 'string'],
        ]);

        foreach ($validated['values'] as $key => $value) {
            SiteSetting::updateOrCreate(
                ['key' => $key],
                ['value' => $value, 'group' => $validated['group']]
            );
        }

        return $this->success(SiteSetting::map($validated['group']), 'Settings updated');
    }
}
