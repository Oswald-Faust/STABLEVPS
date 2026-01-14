import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Ticket from '@/models/Ticket';
import { getCurrentUser } from '@/lib/auth';
import mongoose from 'mongoose';

// GET: Get a specific ticket with all messages
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid ticket ID' },
        { status: 400 }
      );
    }

    await dbConnect();

    const ticket = await Ticket.findOne({
      _id: id,
      userId: currentUser.userId,
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
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
    console.error('Get ticket error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

// POST: Add a reply to a ticket
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid ticket ID' },
        { status: 400 }
      );
    }

    await dbConnect();

    const ticket = await Ticket.findOne({
      _id: id,
      userId: currentUser.userId,
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    if (ticket.status === 'closed') {
      return NextResponse.json(
        { error: 'Cannot reply to a closed ticket' },
        { status: 400 }
      );
    }

    // Add the new message
    ticket.messages.push({
      sender: 'user',
      content: message,
      createdAt: new Date(),
    });

    // Update status to customer_reply
    ticket.status = 'customer_reply';

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
    console.error('Reply ticket error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

// PATCH: Update ticket status (close ticket)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { action } = body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid ticket ID' },
        { status: 400 }
      );
    }

    await dbConnect();

    const ticket = await Ticket.findOne({
      _id: id,
      userId: currentUser.userId,
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    if (action === 'close') {
      ticket.status = 'closed';
      await ticket.save();
    }

    return NextResponse.json({
      success: true,
      message: 'Ticket updated',
      status: ticket.status,
    });

  } catch (error) {
    console.error('Update ticket error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
