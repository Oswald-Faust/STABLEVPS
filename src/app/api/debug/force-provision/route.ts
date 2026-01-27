import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Invoice from '@/models/Invoice';
import { createForexVPS } from '@/lib/vps-provider';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(currentUser.userId);
    
    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has legacy provisioning stuck
    const subscription = user.subscription;
    const vps = user.vps;
    
    if (vps?.status === 'provisioning' && !vps.serverId) {
        console.log('🔄 Found stuck provisioning in legacy fields. Attempting force provision...');
        
        const planId = subscription?.planId || 'basic'; // Default to basic if missing
        const location = vps.location || 'london';
        const label = `vps-${user.firstName}-${user.lastName}-${Date.now()}`;
        
        let vpsId = '';
        let vpsPassword = '';
        let status = 'provisioning';
        
        try {
             // Call Zomro/Vultr/Cloudzy
             const newVps = await createForexVPS(planId, label, location);
             vpsId = newVps.instanceId;
             console.log(`✅ Force provision successful: ${vpsId}`);
        } catch (err: any) {
             console.error('❌ Force provision failed:', err);
             
             // If dev, mock it
             if (process.env.NODE_ENV !== 'production') {
                 vpsId = `mock-force-${Date.now()}`;
                 vpsPassword = `MockPass${Date.now()}!`;
                 console.log('⚠️ Using mock ID for force provision');
             } else {
                 return NextResponse.json({ 
                     status: 'error', 
                     message: 'Failed to provision VPS on provider',
                     detail: err.message 
                 }, { status: 500 });
             }
        }
        
        // Update user
        const newService = {
            planId,
            billingCycle: subscription?.billingCycle || 'monthly',
            status: 'active',
            startDate: new Date(),
            vpsStatus: 'active', // Assume active for mock/zomro immediate result? Or provisioning?
                                 // Zomro is 'provisioning' initially, but let's set it to provisioning 
                                 // and let the /api/user poll unlock it.
            serverId: vpsId,
            location: location,
            rdpUsername: 'Administrator',
            rdpPassword: vpsPassword,
            createdAt: new Date()
        };
        
        // Push to services array
        user.services.push(newService as any);
        
        // Update legacy fields to match
        user.vps!.status = 'provisioning'; // Will be updated by polling
        user.vps!.serverId = vpsId;
        user.subscription!.status = 'active';
        
        await user.save();
        
        return NextResponse.json({
            status: 'success',
            message: 'Force provisioning initiated',
            vpsId,
            note: 'Your VPS is now provisioning. Check dashboard in 1-2 minutes.'
        });
    }

    // Also check if there are any services in the array that are 'provisioning' but have NO server ID (unlikely if loop added it, but possible if manual DB edit)
    // ...

    return NextResponse.json({
        status: 'info',
        message: 'No stuck provisioning found for this user.',
        userStatus: vps?.status,
        serverId: vps?.serverId
    });

  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
