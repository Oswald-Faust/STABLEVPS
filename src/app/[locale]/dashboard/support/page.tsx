"use client";

import { useState, useEffect } from "react";
import { useDashboard } from "../layout";
import Link from "next/link";
import { MessageSquare, Plus, Clock, CheckCircle, AlertCircle, Send, ArrowLeft, Filter } from "lucide-react";

interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  department: string;
  status: 'open' | 'answered' | 'customer_reply' | 'closed';
  priority: string;
  createdAt: string;
  updatedAt: string;
}

interface StatusCounts {
  open: number;
  answered: number;
  customer_reply: number;
  closed: number;
}

export default function SupportPage() {
  const { user } = useDashboard();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [counts, setCounts] = useState<StatusCounts>({ open: 0, answered: 0, customer_reply: 0, closed: 0 });
  const [loading, setLoading] = useState(true);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // New ticket form
  const [newSubject, setNewSubject] = useState('');
  const [newDepartment, setNewDepartment] = useState('technical');
  const [newPriority, setNewPriority] = useState('medium');
  const [newMessage, setNewMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [filterStatus]);

  const fetchTickets = async () => {
    try {
      const res = await fetch(`/api/tickets?status=${filterStatus}`);
      const data = await res.json();
      if (res.ok) {
        setTickets(data.tickets || []);
        setCounts(data.counts || { open: 0, answered: 0, customer_reply: 0, closed: 0 });
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject || !newMessage) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: newSubject,
          department: newDepartment,
          priority: newPriority,
          message: newMessage,
        }),
      });

      if (res.ok) {
        setShowNewTicket(false);
        setNewSubject('');
        setNewMessage('');
        fetchTickets();
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'answered': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'customer_reply': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'closed': return <CheckCircle className="w-4 h-4 text-gray-500" />;
      default: return null;
    }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Support</h1>
          <p className="text-muted text-sm mt-1">Votre historique de demandes</p>
        </div>
        <button 
          onClick={() => setShowNewTicket(true)}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ouvrir une demande
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Sidebar - Filters */}
        <div className="lg:w-64 space-y-4">
          <div className="bg-card border border-card-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-card-border bg-card-border/30 flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted" />
              <span className="font-medium text-foreground text-sm">Voir</span>
            </div>
            <div className="p-2">
              {[
                { key: 'all', label: 'Tous', count: counts.open + counts.answered + counts.customer_reply + counts.closed },
                { key: 'open', label: 'Ouvert', count: counts.open },
                { key: 'answered', label: 'Répondu', count: counts.answered },
                { key: 'customer_reply', label: 'Réponse client', count: counts.customer_reply },
                { key: 'closed', label: 'Fermé', count: counts.closed },
              ].map(filter => (
                <button
                  key={filter.key}
                  onClick={() => setFilterStatus(filter.key)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm flex justify-between items-center transition-colors ${
                    filterStatus === filter.key
                      ? 'bg-green-500/20 text-green-500'
                      : 'text-muted hover:bg-card-border/50'
                  }`}
                >
                  <span>{filter.label}</span>
                  <span className="px-2 py-0.5 bg-card-border rounded-full text-xs">{filter.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-card border border-card-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-card-border bg-card-border/30">
              <span className="font-medium text-foreground text-sm">Support</span>
            </div>
            <div className="p-2">
              <button 
                onClick={() => setShowNewTicket(true)}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-muted hover:bg-card-border/50 flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" /> Ouvrir une demande
              </button>
            </div>
          </div>
        </div>

        {/* Main Content - Tickets List */}
        <div className="flex-1">
          <div className="bg-card border border-card-border rounded-xl overflow-hidden">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-card-border/30 text-xs uppercase text-muted font-medium border-b border-card-border">
              <div className="col-span-3">Département</div>
              <div className="col-span-4">Objet</div>
              <div className="col-span-2">État</div>
              <div className="col-span-3">Dernière mise à jour</div>
            </div>

            {/* Tickets */}
            <div className="divide-y divide-card-border">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500 mx-auto"></div>
                </div>
              ) : tickets.length === 0 ? (
                <div className="p-8 text-center text-muted">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune demande pour le moment</p>
                  <button 
                    onClick={() => setShowNewTicket(true)}
                    className="mt-4 text-green-500 hover:underline"
                  >
                    Créer votre première demande
                  </button>
                </div>
              ) : (
                tickets.map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`/dashboard/support/${ticket.id}`}
                    className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 p-4 hover:bg-card-border/20 transition-colors cursor-pointer"
                  >
                    <div className="md:col-span-3 text-sm text-muted">
                      {getDepartmentLabel(ticket.department)}
                    </div>
                    <div className="md:col-span-4">
                      <span className="text-green-500 font-medium">{ticket.ticketNumber}</span>
                      <p className="text-foreground text-sm">{ticket.subject}</p>
                    </div>
                    <div className="md:col-span-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        {getStatusIcon(ticket.status)}
                        {getStatusLabel(ticket.status)}
                      </span>
                    </div>
                    <div className="md:col-span-3 text-xs text-muted">
                      {formatDate(ticket.updatedAt)}
                    </div>
                  </Link>
                ))
              )}
            </div>

            {/* Pagination info */}
            {tickets.length > 0 && (
              <div className="px-4 py-3 border-t border-card-border bg-card-border/30 text-sm text-muted">
                {tickets.length} demande(s)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Ticket Modal */}
      {showNewTicket && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-card-border rounded-2xl w-full max-w-lg">
            <div className="p-5 border-b border-card-border flex justify-between items-center">
              <h3 className="text-lg font-bold text-foreground">Nouvelle demande</h3>
              <button onClick={() => setShowNewTicket(false)} className="text-muted hover:text-foreground">✕</button>
            </div>
            <form onSubmit={handleCreateTicket} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted mb-2">Sujet *</label>
                <input 
                  type="text" 
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-4 py-3 bg-card-border/30 border border-card-border rounded-lg text-foreground focus:outline-none focus:border-green-500"
                  placeholder="Décrivez brièvement votre problème"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted mb-2">Département</label>
                  <select 
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full px-4 py-3 bg-card-border/30 border border-card-border rounded-lg text-foreground focus:outline-none focus:border-green-500"
                  >
                    <option value="technical">Support technique</option>
                    <option value="billing">Facturation</option>
                    <option value="sales">Commercial</option>
                    <option value="general">Général</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted mb-2">Priorité</label>
                  <select 
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full px-4 py-3 bg-card-border/30 border border-card-border rounded-lg text-foreground focus:outline-none focus:border-green-500"
                  >
                    <option value="low">Basse</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Haute</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-2">Message *</label>
                <textarea 
                  rows={5}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full px-4 py-3 bg-card-border/30 border border-card-border rounded-lg text-foreground focus:outline-none focus:border-green-500 resize-none"
                  placeholder="Décrivez votre problème en détail..."
                  required
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button 
                  type="button"
                  onClick={() => setShowNewTicket(false)}
                  className="px-4 py-2 bg-card-border text-foreground rounded-lg hover:bg-card-border/70 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Envoyer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
