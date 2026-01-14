"use client";

import { useState, useEffect, useRef } from "react";
import { useDashboard } from "../../layout";
import Link from "next/link";
import { ArrowLeft, Send, Clock, User, Shield, X } from "lucide-react";
import { useParams } from "next/navigation";

interface Message {
  sender: 'user' | 'admin';
  content: string;
  createdAt: string;
}

interface TicketDetail {
  id: string;
  ticketNumber: string;
  subject: string;
  department: string;
  priority: string;
  status: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export default function TicketDetailPage() {
  const { user } = useDashboard();
  const params = useParams();
  const ticketId = params.id as string;
  
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTicket();
  }, [ticketId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.messages]);

  const fetchTicket = async () => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`);
      const data = await res.json();
      if (res.ok) {
        setTicket(data.ticket);
      }
    } catch (error) {
      console.error('Error fetching ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !ticket) return;

    setSending(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: reply }),
      });

      if (res.ok) {
        setReply('');
        fetchTicket(); // Refresh ticket to get new message
      }
    } catch (error) {
      console.error('Error sending reply:', error);
    } finally {
      setSending(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!confirm('Êtes-vous sûr de vouloir fermer ce ticket ?')) return;

    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'close' }),
      });

      if (res.ok) {
        fetchTicket();
      }
    } catch (error) {
      console.error('Error closing ticket:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Ouvert';
      case 'answered': return 'Répondu';
      case 'customer_reply': return 'Réponse client';
      case 'closed': return 'Fermé';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-yellow-500 bg-yellow-500/10';
      case 'answered': return 'text-green-500 bg-green-500/10';
      case 'customer_reply': return 'text-blue-500 bg-blue-500/10';
      case 'closed': return 'text-gray-500 bg-gray-500/10';
      default: return 'text-gray-500';
    }
  };

  const getDepartmentLabel = (dept: string) => {
    switch (dept) {
      case 'technical': return 'Support Technique';
      case 'billing': return 'Facturation';
      case 'sales': return 'Commercial';
      case 'general': return 'Général';
      default: return dept;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'low': return 'Basse';
      case 'medium': return 'Moyenne';
      case 'high': return 'Haute';
      case 'urgent': return 'Urgente';
      default: return priority;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-20">
        <p className="text-muted mb-4">Ticket non trouvé</p>
        <Link href="/dashboard/support" className="text-green-500 hover:underline">
          Retour au support
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/support"
            className="p-2 hover:bg-card-border rounded-lg transition-colors text-muted hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <span className="text-green-500 font-bold">{ticket.ticketNumber}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                {getStatusLabel(ticket.status)}
              </span>
            </div>
            <h1 className="text-xl font-bold text-foreground">{ticket.subject}</h1>
          </div>
        </div>
        {ticket.status !== 'closed' && (
          <button 
            onClick={handleCloseTicket}
            className="px-4 py-2 bg-card-border text-foreground rounded-lg hover:bg-red-500/20 hover:text-red-500 transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Fermer le ticket
          </button>
        )}
      </div>

      {/* Ticket Info */}
      <div className="bg-card border border-card-border rounded-xl p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted text-xs uppercase mb-1">Département</p>
            <p className="text-foreground font-medium">{getDepartmentLabel(ticket.department)}</p>
          </div>
          <div>
            <p className="text-muted text-xs uppercase mb-1">Priorité</p>
            <p className="text-foreground font-medium capitalize">{getPriorityLabel(ticket.priority)}</p>
          </div>
          <div>
            <p className="text-muted text-xs uppercase mb-1">Créé le</p>
            <p className="text-foreground font-medium">{formatDate(ticket.createdAt)}</p>
          </div>
          <div>
            <p className="text-muted text-xs uppercase mb-1">Dernière mise à jour</p>
            <p className="text-foreground font-medium">{formatDate(ticket.updatedAt)}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="bg-card border border-card-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-card-border bg-card-border/30">
          <h2 className="font-bold text-foreground">Conversation</h2>
        </div>
        
        <div className="max-h-[500px] overflow-y-auto p-4 space-y-4">
          {ticket.messages.map((message, idx) => (
            <div 
              key={idx}
              className={`flex gap-3 ${message.sender === 'user' ? '' : 'flex-row-reverse'}`}
            >
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                message.sender === 'user' ? 'bg-blue-500/20' : 'bg-green-500/20'
              }`}>
                {message.sender === 'user' ? (
                  <User className={`w-5 h-5 text-blue-500`} />
                ) : (
                  <Shield className={`w-5 h-5 text-green-500`} />
                )}
              </div>
              <div className={`flex-1 ${message.sender === 'user' ? '' : 'text-right'}`}>
                <div className={`inline-block max-w-[80%] p-4 rounded-2xl ${
                  message.sender === 'user' 
                    ? 'bg-blue-500/10 text-foreground rounded-tl-none' 
                    : 'bg-green-500/10 text-foreground rounded-tr-none'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                <p className="text-xs text-muted mt-1 flex items-center gap-1 ${message.sender === 'user' ? '' : 'justify-end'}">
                  <Clock className="w-3 h-3" />
                  {formatDate(message.createdAt)}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply Form */}
        {ticket.status !== 'closed' ? (
          <form onSubmit={handleSendReply} className="p-4 border-t border-card-border bg-card-border/20">
            <div className="flex gap-3">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Écrivez votre réponse..."
                rows={3}
                className="flex-1 px-4 py-3 bg-card border border-card-border rounded-xl text-foreground resize-none focus:outline-none focus:border-green-500"
              />
              <button
                type="submit"
                disabled={sending || !reply.trim()}
                className="self-end px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-4 border-t border-card-border bg-card-border/20 text-center text-muted">
            Ce ticket est fermé. Vous ne pouvez plus y répondre.
          </div>
        )}
      </div>
    </div>
  );
}
