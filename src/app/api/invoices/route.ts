import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import { getCurrentUser } from '@/lib/auth';

// GET: Retrieve user invoices
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

    // Parse query params
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const type = searchParams.get('type'); // 'wallet_topup', 'subscription', 'service'
    const status = searchParams.get('status'); // 'paid', 'pending', 'failed', 'refunded'

    // Build query
    const query: Record<string, unknown> = { userId: currentUser.userId };
    if (type) query.type = type;
    if (status) query.status = status;

    // Get total count
    const total = await Invoice.countDocuments(query);

    // Get invoices with pagination
    const invoices = await Invoice.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      success: true,
      invoices: invoices.map(inv => ({
        id: inv._id.toString(),
        invoiceNumber: inv.invoiceNumber,
        type: inv.type,
        amount: inv.amount,
        currency: inv.currency,
        status: inv.status,
        description: inv.description,
        paymentMethod: inv.paymentMethod,
        paidAt: inv.paidAt,
        createdAt: inv.createdAt,
        metadata: inv.metadata,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Get invoices error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
