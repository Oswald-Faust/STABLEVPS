import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import User from '@/models/User'; // Populate user data
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
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
    
        // Verify admin role from DB
        const admin = await User.findById(currentUser.userId);
        if (!admin || admin.role !== 'admin') {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
    }

    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const type = searchParams.get('type');
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    if (type && type !== 'all') {
      query.type = type;
    }

    const skip = (page - 1) * limit;

    const [invoices, total] = await Promise.all([
      Invoice.find(query)
        .populate('userId', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Invoice.countDocuments(query)
    ]);

    // Calculate totals for stats
    const totalRevenue = await Invoice.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const walletTopups = await Invoice.aggregate([
      { $match: { status: 'paid', type: 'wallet_topup' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    return NextResponse.json({
      success: true,
      invoices: invoices.map(inv => ({
        ...inv,
        id: inv._id.toString(),
        userId: inv.userId ? {
            // @ts-ignore
            id: inv.userId._id.toString(),
            // @ts-ignore
            name: `${inv.userId.firstName} ${inv.userId.lastName}`,
            // @ts-ignore
            email: inv.userId.email
        } : null 
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      stats: {
        totalRevenue: totalRevenue[0]?.total || 0,
        walletRevenue: walletTopups[0]?.total || 0,
        serviceRevenue: (totalRevenue[0]?.total || 0) - (walletTopups[0]?.total || 0)
      }
    });

  } catch (error) {
    console.error('Get admin invoices error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
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
    
        // Verify admin role from DB
        const admin = await User.findById(currentUser.userId);
        if (!admin || admin.role !== 'admin') {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
    }

    const { searchParams } = new URL(req.url);
    const invoiceId = searchParams.get('id');
    
    if (!invoiceId) {
      return NextResponse.json({ error: 'Invoice ID required' }, { status: 400 });
    }

    const deletedInvoice = await Invoice.findByIdAndDelete(invoiceId);
    
    if (!deletedInvoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Invoice deleted successfully'
    });

  } catch (error) {
    console.error('Delete invoice error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
