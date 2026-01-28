"use client";

import { useEffect, useState, useRef } from 'react';
import { 
  MessageSquare, 
  Shield,
  User as UserIcon,
  Send,
  ArrowLeft,
  Search,
  XCircle,
  Loader2,
  Trash2
} from 'lucide-react';
import { useAdmin } from '../layout';

interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  department: string;
  status: 'open' | 'answered' | 'customer_reply' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  messageCount: number;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

interface TicketDetail extends Ticket {
  messages: {
    sender: 'user' | 'admin';
    content: string;
    createdAt: string;
  }[];
}

export default function AdminSupport() {
  const { refreshStats } = useAdmin();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<TicketDetail | null>(null);
  const [isTicketLoading, setIsTicketLoading] = useState(false);
  const [adminReply, setAdminReply] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedTicket]);

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/admin/tickets?status=all');
      const data = await res.json();
      if (data.success) {
        setTickets(data.tickets);
      }
    } catch (error) {
      console.error('Failed to fetch tickets', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketDetail = async (id: string) => {
    setIsTicketLoading(true);
    try {
      const res = await fetch(`/api/admin/tickets/${id}`);
      const data = await res.json();
      if (data.success) {
        setSelectedTicket(data.ticket);
      }
    } catch (error) {
      console.error('Failed to fetch ticket detail', error);
    } finally {
      setIsTicketLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!adminReply.trim() || !selectedTicket) return;
    setIsSendingReply(true);
    try {
      const res = await fetch(`/api/admin/tickets/${selectedTicket.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: adminReply })
      });
      if (res.ok) {
        setAdminReply('');
        await fetchTicketDetail(selectedTicket.id);
        await fetchTickets();
        await refreshStats();
      }
    } catch (error) {
      console.error('Failed to send reply', error);
    } finally {
      setIsSendingReply(false);
    }
  };

  const updateTicketStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        if (selectedTicket?.id === id) await fetchTicketDetail(id);
        await fetchTickets();
        await refreshStats();
      }
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  // Extract cancellation info from ticket messages
  const getCancellationInfo = (ticket: TicketDetail | null) => {
    if (!ticket) return null;
    const isCancellationTicket = ticket.subject.toLowerCase().includes("annulation");
    if (!isCancellationTicket) return null;

    // Try to extract service ID and user ID from the first message
    const firstMessage = ticket.messages[0]?.content || '';
    const serviceIdMatch = firstMessage.match(/Service ID \(DB\) : ([a-f0-9]+)/i);
    const serviceId = serviceIdMatch?.[1] || null;

    return {
      isCancellation: true,
      serviceId,
      userId: ticket.user?.id,
    };
  };

  const handleApproveCancellation = async () => {
    if (!selectedTicket) return;
    
    const cancellationInfo = getCancellationInfo(selectedTicket);
    if (!cancellationInfo?.serviceId || !cancellationInfo?.userId) {
      alert('Impossible d\'extraire les informations de service du ticket. Veuillez annuler manuellement.');
      return;
    }

    if (!confirm(`⚠️ ATTENTION: Cette action va:\n\n• Annuler l'abonnement Stripe\n• Supprimer le VPS sur Cloudzy\n• Mettre à jour la base de données\n• Fermer ce ticket\n\nContinuer ?`)) {
      return;
    }

    setIsCancelling(true);
    try {
      const res = await fetch('/api/admin/cancel-service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: cancellationInfo.userId,
          serviceId: cancellationInfo.serviceId,
          ticketId: selectedTicket.id,
          reason: 'Demande approuvée par l\'administrateur.'
        })
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        alert(`✅ Annulation traitée avec succès!\n\nStripe: ${data.results.stripeCancel ? '✅' : '⚠️'}\nCloudzy: ${data.results.cloudzyDelete ? '✅' : '⚠️'}\nBDD: ${data.results.databaseUpdate ? '✅' : '❌'}`);
        await fetchTicketDetail(selectedTicket.id);
        await fetchTickets();
        await refreshStats();
      } else {
        alert(`❌ Erreur: ${data.error || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Failed to process cancellation', error);
      alert('❌ Erreur lors du traitement de l\'annulation');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleDeleteTicket = async (id: string) => {
    if (!confirm("⚠️ Êtes-vous sûr de vouloir supprimer ce ticket ? Cette action est irréversible.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/tickets?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSelectedTicket(null);
        await fetchTickets();
        await refreshStats();
      } else {
        alert("Erreur lors de la suppression du ticket");
      }
    } catch (error) {
      console.error('Failed to delete ticket', error);
      alert("Erreur lors de la suppression du ticket");
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open': return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-500 rounded-full text-[10px] font-bold uppercase tracking-widest border border-yellow-200 dark:border-yellow-500/20">Ouvert</span>;
      case 'answered': return <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-500 rounded-full text-[10px] font-bold uppercase tracking-widest border border-green-200 dark:border-green-500/20">Répondu</span>;
      case 'customer_reply': return <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-500 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-200 dark:border-blue-500/20">Client</span>;
      case 'closed': return <span className="px-2 py-1 bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400 rounded-full text-[10px] font-bold uppercase tracking-widest border border-gray-200 dark:border-gray-500/20">Fermé</span>;
      default: return <span className="px-2 py-1 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-full text-[10px] uppercase font-bold tracking-widest">{status}</span>;
    }
  };

  const filteredTickets = tickets.filter(t => 
    `${t.subject} ${t.ticketNumber} ${t.user?.name}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-180px)] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex h-full gap-8">
        {/* Support List */}
        <div className={`w-full lg:w-96 flex flex-col bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-xl transition-colors duration-300 ${selectedTicket ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-5 border-b border-gray-100 dark:border-white/5 flex flex-col gap-4">
            <h3 className="font-bold flex items-center gap-2 text-gray-900 dark:text-white">
              <MessageSquare className="w-5 h-5 text-green-600 dark:text-green-500" />
              Tous les tickets
            </h3>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-muted-foreground" />
                <input 
                    type="text"
                    placeholder="Chercher un ticket..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/5 rounded-xl pl-10 pr-4 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-green-500/50 transition-all placeholder:text-gray-400 dark:placeholder:text-muted-foreground"
                />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-white/5">
            {loading ? (
               <div className="p-8 flex justify-center">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
               </div>
            ) : (
                <>
                    {filteredTickets.map(ticket => (
                    <div 
                        key={ticket.id} 
                        onClick={() => fetchTicketDetail(ticket.id)}
                        className={`p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-all relative group ${selectedTicket?.id === ticket.id ? 'bg-gray-100 dark:bg-white/5' : ''}`}
                    >
                        {selectedTicket?.id === ticket.id && <div className="absolute left-0 inset-y-0 w-1 bg-green-500"></div>}
                        <div className="flex justify-between items-start mb-1">
                        <p className="text-[10px] font-bold text-green-600 dark:text-green-500">{ticket.ticketNumber}</p>
                        <span className="text-[10px] text-gray-400 dark:text-muted-foreground">{new Date(ticket.updatedAt).toLocaleDateString()}</span>
                        </div>
                        <h4 className="font-bold text-sm mb-1 line-clamp-1 text-gray-900 dark:text-white">{ticket.subject}</h4>
                        <div className="flex justify-between items-center mt-3">
                        <p className="text-xs text-gray-500 dark:text-muted-foreground">{ticket.user?.name || 'Inconnu'}</p>
                        {getStatusBadge(ticket.status)}
                        </div>
                    </div>
                    ))}
                    {filteredTickets.length === 0 && (
                        <div className="p-12 text-center text-gray-500 dark:text-muted-foreground italic text-sm">
                            {searchQuery ? 'Aucun résultat' : 'Aucun ticket à afficher.'}
                        </div>
                    )}
                </>
            )}
          </div>
        </div>

        {/* Conversation View */}
        <div className={`flex-1 flex-col bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-xl transition-colors duration-300 ${
          selectedTicket 
            ? 'flex' 
            : 'hidden lg:flex items-center justify-center p-12 text-center text-gray-500 dark:text-muted-foreground'
        }`}>
          {!selectedTicket ? (
            <div className="max-w-xs animate-in zoom-in duration-300">
              <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="w-10 h-10 text-gray-400 dark:text-white/20" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Support Technique</h3>
              <p className="text-sm">Sélectionnez une conversation dans la liste pour commencer à répondre aux clients.</p>
            </div>
          ) : (
            <>
              {/* Ticket Header */}
              <div className="px-6 py-5 bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button onClick={() => setSelectedTicket(null)} className="lg:hidden p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors text-gray-500 dark:text-white">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <div className="flex items-center gap-3 mb-0.5">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">{selectedTicket.subject}</h3>
                      {getStatusBadge(selectedTicket.status)}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-muted-foreground">Demandé par <span className="text-green-600 dark:text-green-500 font-bold">{selectedTicket.user?.name}</span> ({selectedTicket.user?.email})</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Bouton Approuver Annulation - visible uniquement pour les tickets d'annulation */}
                  {getCancellationInfo(selectedTicket)?.isCancellation && selectedTicket.status !== 'closed' && (
                    <button
                      onClick={handleApproveCancellation}
                      disabled={isCancelling}
                      className="flex items-center gap-2 px-3 py-1.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-red-500/20"
                    >
                      {isCancelling ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      {isCancelling ? 'Traitement...' : 'Approuver Annulation'}
                    </button>
                  )}
                  <button
                    onClick={() => selectedTicket && handleDeleteTicket(selectedTicket.id)}
                    disabled={isDeleting}
                    className="p-2 bg-gray-100 dark:bg-white/5 hover:bg-red-500 hover:text-white rounded-lg transition-all text-gray-500 dark:text-muted-foreground"
                    title="Supprimer le ticket"
                  >
                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                  <select 
                    value={selectedTicket.status}
                    onChange={(e) => updateTicketStatus(selectedTicket.id, e.target.value)}
                    className="bg-white dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-900 dark:text-white focus:outline-none"
                  >
                    <option value="open">Ouvert</option>
                    <option value="answered">Répondu</option>
                    <option value="customer_reply">Client</option>
                    <option value="closed">Fermé</option>
                  </select>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {selectedTicket.messages.map((message, i) => (
                  <div key={i} className={`flex gap-4 ${message.sender === 'admin' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${message.sender === 'admin' ? 'bg-green-600 dark:bg-green-500 text-white dark:text-black shadow-lg shadow-green-500/20' : 'bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10'}`}>
                      {message.sender === 'admin' ? <Shield className="w-5 h-5" /> : <UserIcon className="w-5 h-5 text-gray-500 dark:text-green-500" />}
                    </div>
                    <div className={`flex-1 max-w-[80%] ${message.sender === 'admin' ? 'text-right' : ''}`}>
                      <div className={`inline-block p-4 rounded-2xl text-sm leading-relaxed ${message.sender === 'admin' ? 'bg-green-100 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-gray-900 dark:text-white rounded-tr-none' : 'bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-tl-none'}`}>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                      <p className="text-[10px] text-gray-400 dark:text-muted-foreground mt-2 font-medium uppercase tracking-widest">{new Date(message.createdAt).toLocaleString('fr-FR')}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
                {isTicketLoading && <div className="text-center py-4 text-xs text-gray-500 dark:text-muted-foreground">Chargement des messages...</div>}
              </div>

              {/* Reply Input */}
              {selectedTicket.status !== 'closed' ? (
                <div className="p-6 bg-gray-50 dark:bg-[#151515] border-t border-gray-200 dark:border-white/5 transition-colors duration-300">
                  <div className="relative group">
                    <textarea
                      value={adminReply}
                      onChange={(e) => setAdminReply(e.target.value)}
                      placeholder={`Répondre à ${selectedTicket.user?.name}...`}
                      className="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-white/5 rounded-2xl p-4 pr-16 text-sm text-gray-900 dark:text-white min-h-[100px] max-h-[300px] resize-none focus:outline-none focus:border-green-500/50 transition-all placeholder:text-gray-400 dark:placeholder:text-muted-foreground"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.ctrlKey) handleSendReply();
                      }}
                    />
                    <button 
                      onClick={handleSendReply}
                      disabled={isSendingReply || !adminReply.trim()}
                      className="absolute bottom-4 right-4 p-3 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white dark:text-black rounded-xl transition-all shadow-lg text-white"
                    >
                      {isSendingReply ? <div className="w-5 h-5 border-2 border-white/20 dark:border-black/20 border-t-white dark:border-t-black rounded-full animate-spin"></div> : <Send className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 dark:text-muted-foreground mt-3 italic">Astuce: CTRL + Entrée pour envoyer rapidement.</p>
                </div>
              ) : (
                <div className="p-6 text-center text-sm bg-gray-50 dark:bg-black/20 text-gray-500 dark:text-muted-foreground border-t border-gray-200 dark:border-white/5">
                  Ticket fermé.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
