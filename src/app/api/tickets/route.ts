import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Ticket from '@/models/Ticket';
import { getCurrentUser } from '@/lib/auth';
import mongoose from 'mongoose';

// GET: List all tickets for the current user
export async function GET(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    // Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { userId: currentUser.userId };
    if (status && status !== 'all') {
      query.status = status;
    }

    const tickets = await Ticket.find(query)
      .sort({ updatedAt: -1 })
      .select('ticketNumber subject department status priority createdAt updatedAt');

    // Count by status
    const statusCounts = await Ticket.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(currentUser.userId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const counts = {
      open: 0,
      answered: 0,
      customer_reply: 0,
      closed: 0,
    };
    statusCounts.forEach(s => {
      if (s._id in counts) {
        counts[s._id as keyof typeof counts] = s.count;
      }
    });

    return NextResponse.json({
      success: true,
      tickets: tickets.map(t => ({
        id: t._id.toString(),
        ticketNumber: t.ticketNumber,
        subject: t.subject,
        department: t.department,
        status: t.status,
        priority: t.priority,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      })),
      counts,
    });

  } catch (error) {
    console.error('Get tickets error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

// POST: Create a new ticket
export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { subject, department, priority, message, relatedService } = body;

    if (!subject || !message) {
      return NextResponse.json(
        { error: 'Subject and message are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const ticket = await Ticket.create({
      userId: currentUser.userId,
      subject: subject.substring(0, 200),
      department: department || 'technical',
      priority: priority || 'medium',
      relatedService,
      messages: [{
        sender: 'user',
        content: message,
        createdAt: new Date(),
      }],
    });

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticket._id.toString(),
        ticketNumber: ticket.ticketNumber,
        subject: ticket.subject,
        status: ticket.status,
      },
      message: 'Ticket created successfully',
    });

  } catch (error) {
    console.error('Create ticket error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
