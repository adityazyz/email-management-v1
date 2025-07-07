// app/api/get-org-admins/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { organizationId } = await req.json();

  console.log('Fetching organization admins for:', organizationId);

  const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

  if (!CLERK_SECRET_KEY) {
    return NextResponse.json({ error: 'Missing Clerk secret key' }, { status: 500 });
  }

  try {
    // Use the correct Clerk API endpoint for organization memberships
    const response = await fetch(
      `https://api.clerk.com/v1/organizations/${organizationId}/memberships`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Clerk API error:', errorData);
      return NextResponse.json({ 
        error: 'Failed to fetch organization memberships',
        details: errorData 
      }, { status: response.status });
    }

    const data = await response.json();
    console.log('Clerk API response:', data);

    // Filter for admin users from the data array
    // The response structure is { data: [...], total_count: number }
    const adminUsers = data.data.filter((membership: any) => 
      membership.role === 'admin' || membership.role === 'org:admin'
    );

    // If no admin users found, return empty result
    if (adminUsers.length === 0) {
      return NextResponse.json({ 
        error: 'No admin users found for this organization' 
      }, { status: 404 });
    }

    // Sort admin users by created_at timestamp (oldest first)
    // created_at is in milliseconds, so lower values are older
    const sortedAdmins = adminUsers.sort((a: any, b: any) => a.created_at - b.created_at);

    // Return only the oldest admin (first in sorted array)
    const oldestAdmin = sortedAdmins[0];

    const dataObj = {
      roleName : oldestAdmin.role_name || oldestAdmin.role,
      membershipId: oldestAdmin.public_user_data?.user_id,
      userId: oldestAdmin.user_id,
      email: oldestAdmin.public_user_data?.identifier,
      firstName : oldestAdmin.public_user_data?.first_name,
      lastName : oldestAdmin.public_user_data?.last_name,
    }
    return NextResponse.json(dataObj);
    
  } catch (error) {
    console.error('Error fetching organization admins:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch organization admins',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}