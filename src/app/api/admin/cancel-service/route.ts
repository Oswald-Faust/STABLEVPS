import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { cookies } from "next/headers";
import User from "@/models/User";
import Ticket from "@/models/Ticket";
import { getCurrentUser } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { deleteVPS } from "@/lib/vps-provider";

/**
 * Admin endpoint to cancel a VPS service
 * This will:
 * 1. Cancel the Stripe subscription
 * 2. Delete the VPS on Cloudzy
 * 3. Update the database
 * 4. Optionally close the related ticket
 */
export async function POST(req: NextRequest) {
  try {
    // Check admin authorization
    // Check for hardcoded admin cookie first
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('admin_access_token');
    
    await dbConnect();

    if (adminToken && adminToken.value === 'granted') {
       // Allow access
    } else {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }
    
        // Check if user is admin
        const adminUser = await User.findById(currentUser.userId);
        if (!adminUser || adminUser.role !== "admin") {
          return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
    }

    const { userId, serviceId, ticketId, reason } = await req.json();

    if (!userId || !serviceId) {
      return NextResponse.json(
        { error: "userId and serviceId are required" },
        { status: 400 }
      );
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find the service
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const service = user.services?.find((s: any) => s._id.toString() === serviceId);
    
    // Check legacy structure if not found in services array
    const isLegacy = !service && user.vps?.serverId;

    if (!service && !isLegacy) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const stripeSubscriptionId = service?.stripeSubscriptionId || user.subscription?.stripeSubscriptionId;
    const serverId = service?.serverId || user.vps?.serverId;

    console.log(`🗑️ Admin cancellation initiated for user ${userId}, service ${serviceId}`);
    console.log(`   Stripe Subscription: ${stripeSubscriptionId}`);
    console.log(`   Server ID (Cloudzy): ${serverId}`);

    const results = {
      stripeCancel: false,
      cloudzyDelete: false,
      databaseUpdate: false,
      ticketClosed: false,
    };

    // Step 1: Cancel Stripe subscription
    if (stripeSubscriptionId) {
      try {
        await stripe.subscriptions.cancel(stripeSubscriptionId);
        console.log(`✅ Stripe subscription ${stripeSubscriptionId} canceled`);
        results.stripeCancel = true;
      } catch (stripeError) {
        console.error(`⚠️ Failed to cancel Stripe subscription:`, stripeError);
        // Continue anyway - subscription might already be canceled
      }
    } else {
      console.log(`ℹ️ No Stripe subscription ID found`);
    }

    // Step 2: Delete VPS on Cloudzy
    if (serverId) {
      try {
        const deleted = await deleteVPS(serverId);
        if (deleted) {
          console.log(`✅ Cloudzy VPS ${serverId} deleted`);
          results.cloudzyDelete = true;
        } else {
          console.warn(`⚠️ Cloudzy VPS deletion returned false`);
        }
      } catch (cloudzyError) {
        console.error(`⚠️ Failed to delete Cloudzy VPS:`, cloudzyError);
        // Continue anyway - VPS might already be deleted or is a mock
      }
    } else {
      console.log(`ℹ️ No server ID found`);
    }

    // Step 3: Update database
    if (isLegacy) {
      // Legacy structure - update vps and subscription fields
      await User.findByIdAndUpdate(userId, {
        $set: {
          "vps.status": "terminated",
          "subscription.status": "canceled",
        },
      });
      console.log(`✅ Legacy user VPS marked as terminated`);
      results.databaseUpdate = true;
    } else {
      // New structure - update specific service in array
      await User.findOneAndUpdate(
        { _id: userId, "services._id": serviceId },
        {
          $set: {
            "services.$.status": "canceled",
            "services.$.vpsStatus": "terminated",
          },
        }
      );
      console.log(`✅ Service ${serviceId} marked as canceled/terminated`);
      results.databaseUpdate = true;
    }

    // Step 4: Close the related ticket if provided
    if (ticketId) {
      try {
        const cancellationMessage = `
✅ DEMANDE D'ANNULATION APPROUVÉE

L'administrateur a traité votre demande d'annulation.

ACTIONS EFFECTUÉES :
${results.stripeCancel ? "• ✅ Abonnement Stripe annulé" : "• ⚠️ Aucun abonnement Stripe à annuler"}
${results.cloudzyDelete ? "• ✅ Serveur VPS supprimé" : "• ⚠️ Serveur VPS non supprimé (peut-être déjà supprimé)"}
${results.databaseUpdate ? "• ✅ Base de données mise à jour" : "• ❌ Erreur de mise à jour"}

${reason ? `COMMENTAIRE ADMIN :\n${reason}` : ""}

Merci d'avoir utilisé StableVPS. N'hésitez pas à revenir si vous avez besoin d'un nouveau VPS.
        `.trim();

        await Ticket.findByIdAndUpdate(ticketId, {
          status: "closed",
          $push: {
            messages: {
              sender: "admin",
              content: cancellationMessage,
              createdAt: new Date(),
            },
          },
        });
        console.log(`✅ Ticket ${ticketId} closed with admin response`);
        results.ticketClosed = true;
      } catch (ticketError) {
        console.error(`⚠️ Failed to close ticket:`, ticketError);
      }
    }

    console.log(`✅ Cancellation complete:`, results);

    return NextResponse.json({
      success: true,
      message: "Service cancellation processed",
      results,
    });

  } catch (error) {
    console.error("❌ Error in admin cancel-service:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
