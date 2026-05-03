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
    const { data: profile } = await serviceSupabase
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single();

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
    
    // Call the n8n webhook from the server to completely avoid any CORS issues in the browser
    const n8nResponse = await fetch("https://babbudev123321.app.n8n.cloud/webhook/8a6b1cc5-950b-4c7a-9876-5d5c43158bc7", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!n8nResponse.ok) {
      // Refund credits if n8n fails
      await serviceSupabase
        .from('profiles')
        .update({ credits: profile.credits })
        .eq('id', user.id);
        
      return NextResponse.json({ error: "Failed from n8n" }, { status: n8nResponse.status });
    }

    const contentType = n8nResponse.headers.get("content-type") || "";

    // If n8n returns JSON (e.g. with the video URL)
    if (contentType.includes("application/json")) {
      const data = await n8nResponse.json();
      return NextResponse.json(data);
    } 
    // If n8n returns binary file, forward it with correct video/mp4 headers
    else {
      const arrayBuffer = await n8nResponse.arrayBuffer();
      return new NextResponse(arrayBuffer, {
        headers: {
          "Content-Type": "video/mp4",
          "Content-Disposition": 'inline; filename="video.mp4"',
        },
      });
    }
  } catch (error) {
    console.error("API proxy error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
