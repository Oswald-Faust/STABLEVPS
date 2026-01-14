import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';

// GET: Download invoice as PDF (returns HTML that can be printed/saved as PDF)
export async function GET(
  request: NextRequest,
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

    await dbConnect();

    const { id } = await params;
    const invoice = await Invoice.findById(id);

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Verify the invoice belongs to this user
    if (invoice.userId.toString() !== currentUser.userId) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    // Get user details for the invoice
    const user = await User.findById(currentUser.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Format dates
    const invoiceDate = new Date(invoice.createdAt).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const paidDate = invoice.paidAt 
      ? new Date(invoice.paidAt).toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : invoiceDate;

    // Get invoice type label
    const typeLabels: Record<string, string> = {
      wallet_topup: 'Rechargement de solde',
      subscription: 'Abonnement VPS',
      service: 'Service',
    };

    // Generate HTML invoice
    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Facture ${invoice.invoiceNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      background: #f8f9fa;
      padding: 40px;
      color: #333;
    }
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 50px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      padding-bottom: 30px;
      border-bottom: 2px solid #eee;
    }
    .company-info h1 {
      font-size: 28px;
      color: #6366f1;
      margin-bottom: 5px;
    }
    .company-info p {
      color: #666;
      font-size: 14px;
    }
    .invoice-details {
      text-align: right;
    }
    .invoice-details h2 {
      font-size: 32px;
      color: #333;
      margin-bottom: 10px;
    }
    .invoice-details p {
      color: #666;
      font-size: 14px;
      margin-bottom: 5px;
    }
    .invoice-number {
      display: inline-block;
      background: #6366f1;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 14px;
    }
    .billing-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
    }
    .billing-section h3 {
      font-size: 12px;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 10px;
    }
    .billing-section p {
      color: #333;
      font-size: 14px;
      line-height: 1.6;
    }
    .items-table {
      width: 100%;
      margin-bottom: 30px;
      border-collapse: collapse;
    }
    .items-table th {
      background: #f8f9fa;
      padding: 15px;
      text-align: left;
      font-size: 12px;
      text-transform: uppercase;
      color: #666;
      border-bottom: 2px solid #eee;
    }
    .items-table td {
      padding: 20px 15px;
      border-bottom: 1px solid #eee;
      font-size: 14px;
    }
    .items-table .amount {
      text-align: right;
      font-weight: bold;
    }
    .totals {
      margin-left: auto;
      width: 300px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      font-size: 14px;
    }
    .totals-row.total {
      border-top: 2px solid #333;
      padding-top: 15px;
      margin-top: 10px;
      font-size: 18px;
      font-weight: bold;
    }
    .status-badge {
      display: inline-block;
      padding: 8px 20px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 14px;
      margin-top: 20px;
    }
    .status-paid {
      background: #dcfce7;
      color: #166534;
    }
    .status-pending {
      background: #fef3c7;
      color: #92400e;
    }
    .status-failed {
      background: #fee2e2;
      color: #991b1b;
    }
    .footer {
      margin-top: 50px;
      padding-top: 30px;
      border-top: 1px solid #eee;
      text-align: center;
      color: #999;
      font-size: 12px;
    }
    .payment-method {
      background: #f8f9fa;
      padding: 15px 20px;
      border-radius: 8px;
      margin-top: 20px;
      font-size: 14px;
    }
    .payment-method strong {
      color: #333;
    }
    @media print {
      body {
        background: white;
        padding: 0;
      }
      .invoice-container {
        box-shadow: none;
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <div class="company-info">
        <h1>STABLEVPS</h1>
        <p>Premium Forex Trading VPS</p>
        <p>Ultra-Low Latency Solutions</p>
      </div>
      <div class="invoice-details">
        <h2>FACTURE</h2>
        <span class="invoice-number">${invoice.invoiceNumber}</span>
        <p style="margin-top: 15px;"><strong>Date d'émission:</strong> ${invoiceDate}</p>
        <p><strong>Date de paiement:</strong> ${paidDate}</p>
      </div>
    </div>

    <div class="billing-info">
      <div class="billing-section">
        <h3>Facturé à</h3>
        <p><strong>${user.firstName} ${user.lastName}</strong></p>
        <p>${user.email}</p>
        ${user.address?.street ? `<p>${user.address.street}</p>` : ''}
        ${user.address?.city ? `<p>${user.address.zipCode || ''} ${user.address.city}</p>` : ''}
        ${user.address?.country ? `<p>${user.address.country}</p>` : ''}
      </div>
      <div class="billing-section" style="text-align: right;">
        <h3>Émis par</h3>
        <p><strong>STABLEVPS</strong></p>
        <p>Services Cloud & VPS</p>
        <p>contact@stablevps.com</p>
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th>Description</th>
          <th>Type</th>
          <th class="amount">Montant</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>${invoice.description}</strong>
            ${invoice.metadata?.previousBalance !== undefined ? `
              <br><small style="color: #666;">Solde précédent: $${invoice.metadata.previousBalance.toFixed(2)}</small>
              <br><small style="color: #666;">Nouveau solde: $${invoice.metadata.newBalance?.toFixed(2) || 'N/A'}</small>
            ` : ''}
          </td>
          <td>${typeLabels[invoice.type] || invoice.type}</td>
          <td class="amount">$${invoice.amount.toFixed(2)} ${invoice.currency}</td>
        </tr>
      </tbody>
    </table>

    <div class="totals">
      <div class="totals-row">
        <span>Sous-total</span>
        <span>$${invoice.amount.toFixed(2)}</span>
      </div>
      <div class="totals-row">
        <span>TVA (0%)</span>
        <span>$0.00</span>
      </div>
      <div class="totals-row total">
        <span>Total</span>
        <span>$${invoice.amount.toFixed(2)} ${invoice.currency}</span>
      </div>
    </div>

    <span class="status-badge status-${invoice.status}">
      ${invoice.status === 'paid' ? '✓ PAYÉE' : 
        invoice.status === 'pending' ? '⏳ EN ATTENTE' : 
        invoice.status === 'refunded' ? '↩ REMBOURSÉE' : '✕ ÉCHEC'}
    </span>

    ${invoice.paymentMethod?.type ? `
    <div class="payment-method">
      <strong>Moyen de paiement:</strong> 
      ${invoice.paymentMethod.brand ? invoice.paymentMethod.brand.toUpperCase() : 'Carte'} 
      ${invoice.paymentMethod.last4 ? `•••• ${invoice.paymentMethod.last4}` : ''}
    </div>
    ` : ''}

    <div class="footer">
      <p>Merci pour votre confiance !</p>
      <p style="margin-top: 10px;">STABLEVPS - Premium Forex Trading VPS Solutions</p>
      <p style="margin-top: 5px;">Cette facture a été générée automatiquement.</p>
    </div>
  </div>
</body>
</html>
    `;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="${invoice.invoiceNumber}.html"`,
      },
    });

  } catch (error) {
    console.error('Download invoice error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
