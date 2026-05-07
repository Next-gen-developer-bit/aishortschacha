import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createServiceClient } from '@/utils/supabase/service';

export async function POST(request) {
  try {
    const supabase = await createClient();
    const serviceSupabase = createServiceClient();
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check credits securely
    const COST_PER_GENERATION = 10;
    const { data: profile, error: profileError } = await serviceSupabase
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
      return NextResponse.json({ error: `Failed to fetch profile: ${profileError.message}` }, { status: 500 });
    }

    if (!profile || profile.credits < COST_PER_GENERATION) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 403 });
    }

    // Deduct credits immediately
    const { error: deductError } = await serviceSupabase
      .from('profiles')
      .update({ credits: profile.credits - COST_PER_GENERATION })
      .eq('id', user.id);

    if (deductError) {
      return NextResponse.json({ error: "Failed to deduct credits" }, { status: 500 });
    }

    const body = await request.json();
    const { script, style, timestamp, reference_image } = body;

    // Create a new video generation job
    const { data: job, error: jobError } = await serviceSupabase
      .from('video_generations')
      .insert({
        user_id: user.id,
        script: script,
        style: style,
        status: 'processing'
      })
      .select('id')
      .single();

    if (jobError) {
      console.error("Failed to insert job:", jobError);
      // Refund credits
      await serviceSupabase.from('profiles').update({ credits: profile.credits }).eq('id', user.id);
      return NextResponse.json({ error: "Failed to create generation job" }, { status: 500 });
    }

    // Call the n8n webhook from the server (fire-and-forget with timeout)
    const n8nPayload = {
      ...body,
      job_id: job.id, // Pass job_id to n8n so it knows which record to update
      user_id: user.id
    };

    // Use a short timeout so Vercel doesn't kill the function
    // n8n will process the job in the background regardless
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const n8nResponse = await fetch("https://babbudev123321.app.n8n.cloud/webhook/8a6b1cc5-950b-4c7a-9876-5d5c43158bc7", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(n8nPayload),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!n8nResponse.ok) {
        // Refund credits if n8n explicitly rejects the request
        await serviceSupabase.from('profiles').update({ credits: profile.credits }).eq('id', user.id);
        await serviceSupabase.from('video_generations').update({ status: 'failed' }).eq('id', job.id);
        return NextResponse.json({ error: "Failed from n8n" }, { status: n8nResponse.status });
      }
    } catch (fetchError) {
      clearTimeout(timeout);
      // Timeout or network error — n8n likely still received the request
      // (we can see executions running in n8n even when Vercel times out)
      // Don't fail — the job is already in the DB and n8n will process it
      console.log("n8n fetch timed out or errored, but job was created:", fetchError.message);
    }

    // Always return the job ID so the frontend can start polling
    return NextResponse.json({ success: true, job_id: job.id, status: 'processing' });
  } catch (error) {
    console.error("API proxy error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
