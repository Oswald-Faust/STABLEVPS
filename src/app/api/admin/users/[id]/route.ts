import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Invoice from '@/models/Invoice';
import Ticket from '@/models/Ticket';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    await dbConnect();

    // Verify admin role from DB to be sure
    const admin = await User.findById(currentUser.userId);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized as admin' }, { status: 403 });
    }

    const { id } = await params;

    // Ensure valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid User ID' }, { status: 400 });
    }

    // Fetch User with explict ObjectId cast
    const user = await User.findOne({ _id: new mongoose.Types.ObjectId(id) }).select('-password');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch Invoices
    const invoices = await Invoice.find({ userId: id }).sort({ createdAt: -1 });

    // Fetch Tickets
    const tickets = await Ticket.find({ userId: id }).sort({ updatedAt: -1 });

    // Calculate stats
    const totalSpent = invoices
        .filter(i => i.status === 'paid')
        .reduce((sum, i) => sum + (i.amount || 0), 0);

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        balance: user.balance,
        role: user.role,
        services: user.services || [],
        address: user.address,
        createdAt: user.createdAt,
        totalSpent
      },
      invoices: invoices.map(inv => ({
          id: inv._id.toString(),
          invoiceNumber: inv.invoiceNumber,
          amount: inv.amount,
          status: inv.status,
          type: inv.type,
          createdAt: inv.createdAt
      })),
      tickets: tickets.map(t => ({
          id: t._id.toString(),
          ticketNumber: t.ticketNumber,
          subject: t.subject,
          status: t.status,
          updatedAt: t.updatedAt
      }))
    });

  } catch (error) {
    console.error('Get admin user details error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
