import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import Ticket from '@/models/Ticket';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';

// GET: List all tickets (admin only)
export async function GET(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    
    // Check for hardcoded admin cookie first
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('admin_access_token');
    
    await dbConnect();

    if (adminToken && adminToken.value === 'granted') {
      // Allow access, hardcoded admin
    } else {
      if (!currentUser) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
      }

      // Check if user is admin
      const user = await User.findById(currentUser.userId);
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const total = await Ticket.countDocuments(query);
    const tickets = await Ticket.find(query)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('userId', 'firstName lastName email');

    // Count by status
    const statusCounts = await Ticket.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const counts = {
      open: 0,
      answered: 0,
      customer_reply: 0,
      closed: 0,
    };
    statusCounts.forEach(s => {
      counts[s._id as keyof typeof counts] = s.count;
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
        messageCount: t.messages.length,
        user: t.userId ? {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          id: (t.userId as any)._id?.toString(),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          name: `${(t.userId as any).firstName || ''} ${(t.userId as any).lastName || ''}`.trim(),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          email: (t.userId as any).email,
        } : null,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      })),
      counts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Admin get tickets error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('admin_access_token');
    
    await dbConnect();

    if (adminToken && adminToken.value === 'granted') {
      // Allow access
    } else {
      if (!currentUser) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
      }
      const admin = await User.findById(currentUser.userId);
      if (!admin || admin.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Ticket ID required' }, { status: 400 });
    }

    const deletedTicket = await Ticket.findByIdAndDelete(id);

    if (!deletedTicket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Ticket deleted successfully' });

  } catch (error) {
    console.error('Admin delete ticket error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
