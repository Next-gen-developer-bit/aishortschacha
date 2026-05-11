import { NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, newPassword } = body;

    if (!email || !newPassword) {
      return NextResponse.json(
        { error: 'Email and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const serviceSupabase = createServiceClient();

    // Look up the user by email
    // Note: admin.listUsers fetches up to 50 users per page by default.
    // If the application grows large, a different approach to find users by email might be needed.
    let userToUpdate = null;
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await serviceSupabase.auth.admin.listUsers({
        page: page,
        perPage: 1000,
      });

      if (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
          { error: 'Failed to look up user' },
          { status: 500 }
        );
      }

      if (data && data.users) {
        const user = data.users.find((u) => u.email === email);
        if (user) {
          userToUpdate = user;
          break;
        }
        
        if (data.users.length < 1000) {
          hasMore = false;
        } else {
          page++;
        }
      } else {
        hasMore = false;
      }
    }

    if (!userToUpdate) {
      // Return 404 but generic message for security
      return NextResponse.json(
        { error: 'No user found with that email address' },
        { status: 404 }
      );
    }

    // Update the password directly
    const { error: updateError } = await serviceSupabase.auth.admin.updateUserById(
      userToUpdate.id,
      { password: newPassword }
    );

    if (updateError) {
      console.error('Error updating password:', updateError);
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
