import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { withTriage, MODEL_VERSION } from "@/lib/ml/triage";

/**
 * One-shot backfill: triage every complaint that hasn't been scored with the
 * current model. The list/detail pages triage lazily as staff browse, so this
 * only exists to score the whole backlog at once (e.g. right after deploy).
 *
 *   curl -X POST https://<host>/api/triage-backfill   (must be signed in as an admin)
 */
export async function POST() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Not authorised" }, { status: 401 });
  }

  const supabase = createAdminClient();
  let scored = 0;

  for (let i = 0; i < 1000; i++) {
    const { data, error } = await supabase
      .from("complaints")
      .select("*")
      .or(`ai_predicted_at.is.null,ai_model_version.neq.${MODEL_VERSION}`)
      .limit(200);

    if (error) {
      return NextResponse.json({ error: error.message, scored }, { status: 500 });
    }
    if (!data || data.length === 0) break;

    await withTriage(data);
    scored += data.length;
  }

  return NextResponse.json({ ok: true, scored, model: MODEL_VERSION });
}
