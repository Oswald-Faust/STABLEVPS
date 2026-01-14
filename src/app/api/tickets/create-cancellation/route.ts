import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/auth";
import { PLANS } from "@/lib/plans";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { serviceId, ipAddress, planName } = await req.json();

    if (!serviceId) {
      return NextResponse.json({ error: "Service ID is required" }, { status: 400 });
    }

    await dbConnect();

    // Check if there is already an open cancellation ticket for this service
    // Avoid creating duplicates
    const existingTicket = await Ticket.findOne({
      userId: user.userId,
      status: { $in: ["open", "pending", "answered"] },
      subject: { $regex: "Demande d'annulation", $options: "i" },
      // Check message content for service ID
      "messages.0.content": { $regex: serviceId, $options: "i" }, 
    });

    if (existingTicket) {
      return NextResponse.json({ 
        success: true, 
        ticketId: existingTicket._id,
        message: "A cancellation request is already open for this service." 
      });
    }

    // Find the specific service in user's services list to get full details
    const dbUser = await User.findById(user.userId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const service = dbUser?.services?.find((s: any) => s._id.toString() === serviceId) || 
                    (dbUser?.vps?.status && !dbUser?.services?.length ? { 
                        // Fallback for legacy structure
                        _id: 'legacy',
                        planId: dbUser.subscription?.planId,
                        subscription: dbUser.subscription,
                        vps: dbUser.vps,
                        billingCycle: dbUser.subscription?.billingCycle,
                        currentPeriodEnd: dbUser.subscription?.currentPeriodEnd,
                        stripeSubscriptionId: dbUser.subscription?.stripeSubscriptionId,
                        serverId: dbUser.vps?.serverId,
                        location: dbUser.vps?.location,
                        createdAt: dbUser.vps?.createdAt
                    } : null);

    // Default values if service lookup fails (should not happen usually)
    const pName = planName || 'VPS';
    const pIp = ipAddress || 'Pending';
    
    // Get Plan Specs
    // @ts-expect-error - indexing with string on PLANS might fail type check if strict
    const planDetails = PLANS[service?.planId as keyof typeof PLANS] || PLANS['basic'];
    
    const formattedDate = service?.currentPeriodEnd 
        ? new Date(service.currentPeriodEnd).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
        : 'Fin de période';

    const creationDate = service?.createdAt
        ? new Date(service.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
        : 'Inconnue';

    const subject = `Demande d'annulation - ${pName} - ${pIp}`;
    
    const ticketMessage = `DEMANDE D'ANNULATION DE SERVICE
---------------------------------------------------
Le client souhaite annuler le service VPS suivant.

INFORMATIONS GÉNÉRALES
-------------------
• Plan : ${planDetails.name} (${service?.planId})
• Prix : $${service?.billingCycle === 'yearly' ? planDetails.yearlyPrice : planDetails.monthlyPrice} USD
• Cycle : ${service?.billingCycle || 'Mensuel'}
• Date de création : ${creationDate}
• Date d'échéance : ${formattedDate}

SPÉCIFICATIONS TECHNIQUES
-------------------
• IP Address : ${pIp}
• Localisation : ${service?.location || 'London'}
• CPU : ${planDetails.specs.cpu}
• RAM : ${planDetails.specs.ram}
• Stockage : ${planDetails.specs.storage}
• OS : ${planDetails.specs.os}

IDENTIFIANTS SYSTÈME
-------------------
• Service ID (DB) : ${serviceId}
• Stripe Subscription ID : ${service?.stripeSubscriptionId || 'N/A'}
• Vultr Server ID : ${service?.serverId || 'N/A'}

INSTRUCTIONS
-------------------
Merci de procéder à l'annulation de ce service et de stopper le renouvellement automatique. L'arrêt définitif du serveur doit être programmé pour le ${formattedDate}.`;

    // Generate ticket number
    const ticketCount = await Ticket.countDocuments();
    const ticketNumber = (1000 + ticketCount + 1).toString();

    const ticket = await Ticket.create({
      ticketNumber,
      userId: user.userId,
      subject,
      status: "open",
      priority: "high", // High priority for cancellations
      messages: [{
            sender: "user",
            content: ticketMessage,
            createdAt: new Date(),
      }]
    });

    return NextResponse.json({ success: true, ticketId: ticket._id });

  } catch (error) {
    console.error("Error creating cancellation ticket:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
