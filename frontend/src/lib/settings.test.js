import test from "node:test";
import assert from "node:assert/strict";

import { normalizeSettings } from "./settings.js";

test("fills missing toggle values with explicit booleans", () => {
  assert.deepEqual(normalizeSettings({ notify_new_matches: true }), {
    profile_visible: false,
    share_data_with_universities: false,
    notify_new_matches: true,
    notify_application_status: false,
    notify_news: false,
  });
});

test("preserves explicit false values when sending updates", () => {
  assert.deepEqual(normalizeSettings({ notify_application_status: false }), {
    profile_visible: false,
    share_data_with_universities: false,
    notify_new_matches: false,
    notify_application_status: false,
    notify_news: false,
  });
});
