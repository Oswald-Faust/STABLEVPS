import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';
import { getVPSDetails } from '@/lib/vultr';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    await dbConnect();

    const user = await User.findById(currentUser.userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check for provisioning status update for legacy VPS field
    if (user.vps?.status === 'provisioning' && user.vps?.serverId) {
       try {
         const vpsDetails = await getVPSDetails(user.vps.serverId);
         if (vpsDetails && vpsDetails.default_password) {
            console.log('✅ VPS Provisioning finished. password received.');
            
            // Update User DB
             await User.findByIdAndUpdate(user._id, {
               'vps.status': 'active',
               'vps.ipAddress': vpsDetails.main_ip,
               'vps.rdpUsername': 'Administrator', // Standard for Windows
               'vps.rdpPassword': vpsDetails.default_password,
             });

            // Update local user object for response
            user.vps.status = 'active';
            user.vps.ipAddress = vpsDetails.main_ip;
            user.vps.rdpUsername = 'Administrator';
            user.vps.rdpPassword = vpsDetails.default_password;
         }
       } catch (err) {
         console.error('Failed to check VPS status', err);
       }
    }

    // Check provisioning status for services array
    if (user.services && user.services.length > 0) {
      for (let i = 0; i < user.services.length; i++) {
        const service = user.services[i];
        if (service.vpsStatus === 'provisioning' && service.serverId) {
          try {
            const vpsDetails = await getVPSDetails(service.serverId);
            if (vpsDetails && vpsDetails.default_password) {
              console.log(`✅ Service ${i} VPS Provisioning finished.`);
              
              // Update in database
              await User.updateOne(
                { _id: user._id, 'services._id': service._id },
                { 
                  $set: {
                    'services.$.vpsStatus': 'active',
                    'services.$.ipAddress': vpsDetails.main_ip,
                    'services.$.rdpUsername': 'Administrator',
                    'services.$.rdpPassword': vpsDetails.default_password,
                  }
                }
              );

              // Update local for response
              service.vpsStatus = 'active';
              service.ipAddress = vpsDetails.main_ip;
              service.rdpUsername = 'Administrator';
              service.rdpPassword = vpsDetails.default_password;
            }
          } catch (err) {
            console.error(`Failed to check VPS status for service ${i}`, err);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        balance: user.balance || 0,
        // New services array (supports multiple VPS)
        services: user.services || [],
        // Legacy fields for backward compatibility
        subscription: user.subscription,
        vps: user.vps,
        address: user.address,
        role: user.role,
        createdAt: user.createdAt,
      },
    });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { firstName, lastName, address } = body;

    // Validate if necessary, currently simple update
    await dbConnect();
    
    // Build update object to avoid overwriting with undefined
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (address) {
        updateData.address = { ... address }; // Ensure it treats it as object
    }

    const updatedUser = await User.findByIdAndUpdate(
        currentUser.userId,
        { $set: updateData },
        { new: true, runValidators: true }
    );

    if (!updatedUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
        success: true,
        user: {
            id: updatedUser._id.toString(),
            email: updatedUser.email,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            subscription: updatedUser.subscription,
            vps: updatedUser.vps,
            address: updatedUser.address,
            createdAt: updatedUser.createdAt
        }
    });

  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'An error occurred updating user' },
      { status: 500 }
    );
  }
}
