import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import Ticket from '@/models/Ticket';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';
import mongoose from 'mongoose';

// GET: Get a specific ticket with all messages (admin)
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    
    // Check for hardcoded admin cookie first
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('admin_access_token');
    
    await dbConnect();
    
    if (adminToken && adminToken.value === 'granted') {
       // Allow access
    } else {
        if (!currentUser) {
          return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }
    
        // Check if user is admin
        const adminUser = await User.findById(currentUser.userId);
        if (!adminUser || adminUser.role !== 'admin') {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ticket ID' }, { status: 400 });
    }

    const ticket = await Ticket.findById(id).populate('userId', 'firstName lastName email');

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticket._id.toString(),
        ticketNumber: ticket.ticketNumber,
        subject: ticket.subject,
        department: ticket.department,
        priority: ticket.priority,
        status: ticket.status,
        relatedService: ticket.relatedService,
        user: ticket.userId ? {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          id: (ticket.userId as any)._id?.toString(),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          name: `${(ticket.userId as any).firstName || ''} ${(ticket.userId as any).lastName || ''}`.trim(),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          email: (ticket.userId as any).email,
        } : null,
        messages: ticket.messages.map(m => ({
          sender: m.sender,
          content: m.content,
          createdAt: m.createdAt,
        })),
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
      },
    });

  } catch (error) {
    console.error('Admin get ticket error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

// POST: Admin reply to a ticket
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    
    // Check for hardcoded admin cookie first
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('admin_access_token');

    await dbConnect();
    
    if (adminToken && adminToken.value === 'granted') {
       // Allow access
    } else {
        if (!currentUser) {
          return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }
    
        // Check if user is admin
        const adminUser = await User.findById(currentUser.userId);
        if (!adminUser || adminUser.role !== 'admin') {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
    }

    const { id } = await params;
    const body = await req.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ticket ID' }, { status: 400 });
    }

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Add the admin reply
    ticket.messages.push({
      sender: 'admin',
      content: message,
      createdAt: new Date(),
    });

    // Update status to answered
    ticket.status = 'answered';

    await ticket.save();

    return NextResponse.json({
      success: true,
      message: 'Reply sent successfully',
      ticket: {
        id: ticket._id.toString(),
        status: ticket.status,
        messageCount: ticket.messages.length,
      },
    });

  } catch (error) {
    console.error('Admin reply ticket error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

// PATCH: Update ticket status (admin)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    
    // Check for hardcoded admin cookie first
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('admin_access_token');

    await dbConnect();
    
    if (adminToken && adminToken.value === 'granted') {
       // Allow access
    } else {
        if (!currentUser) {
          return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }
    
        // Check if user is admin
        const adminUser = await User.findById(currentUser.userId);
        if (!adminUser || adminUser.role !== 'admin') {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
    }

    const { id } = await params;
    const body = await req.json();
    const { status, priority } = body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ticket ID' }, { status: 400 });
    }

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    if (status) {
      ticket.status = status;
    }
    if (priority) {
      ticket.priority = priority;
    }

    await ticket.save();

    return NextResponse.json({
      success: true,
      message: 'Ticket updated',
      ticket: {
        id: ticket._id.toString(),
        status: ticket.status,
        priority: ticket.priority,
      },
    });

  } catch (error) {
    console.error('Admin update ticket error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
