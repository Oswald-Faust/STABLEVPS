import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  await dbConnect();
  
  const currentUser = await getCurrentUser();
  let email = 'faustfrank@gmail.com';

  if (currentUser && currentUser.email) {
    email = currentUser.email;
  }
  
  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { role: 'admin' },
    { new: true }
  );

  if (!user) {
    return NextResponse.json({ 
      success: false, 
      message: `User with email ${email} not found. Please log in first or ensure the account exists.` 
    }, { status: 404 });
  }

  return NextResponse.json({ 
    success: true, 
    message: `${email} is now an admin. You can now access /admin`,
    user: {
      email: user.email,
      role: user.role
    }
  });
}
