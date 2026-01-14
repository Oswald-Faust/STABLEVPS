"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface UserInfoModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedUser: any) => void;
}

export default function UserInfoModal({ user, isOpen, onClose, onUpdate }: UserInfoModalProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address: {
      street: "",
      city: "",
      zipCode: "",
      country: "",
    },
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        address: {
          street: user.address?.street || "",
          city: user.address?.city || "",
          zipCode: user.address?.zipCode || "",
          country: user.address?.country || "",
        },
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (["street", "city", "zipCode", "country"].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [name]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        onUpdate(data.user);
        onClose();
      } else {
        console.error("Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">Mettre à jour vos informations</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Prénom</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-sm outline-none focus:ring-2 focus:ring-green-500 text-gray-800 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Nom</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-sm outline-none focus:ring-2 focus:ring-green-500 text-gray-800 dark:text-white"
                required
              />
            </div>
          </div>

          <div>
             <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Adresse</label>
             <input
                type="text"
                name="street"
                value={formData.address.street}
                onChange={handleChange}
                placeholder="123 Rue de l'Exemple"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-sm outline-none focus:ring-2 focus:ring-green-500 text-gray-800 dark:text-white"
             />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Ville</label>
               <input
                 type="text"
                 name="city"
                 value={formData.address.city}
                 onChange={handleChange}
                 className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-sm outline-none focus:ring-2 focus:ring-green-500 text-gray-800 dark:text-white"
               />
            </div>
            <div>
               <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Code Postal</label>
               <input
                 type="text"
                 name="zipCode"
                 value={formData.address.zipCode}
                 onChange={handleChange}
                 className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-sm outline-none focus:ring-2 focus:ring-green-500 text-gray-800 dark:text-white"
               />
            </div>
          </div>
          
           <div>
             <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Pays</label>
             <input
                type="text"
                name="country"
                value={formData.address.country}
                onChange={handleChange}
                placeholder="France"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-sm outline-none focus:ring-2 focus:ring-green-500 text-gray-800 dark:text-white"
             />
          </div>

          <div className="flex gap-2 pt-2">
            <button
               type="button"
               onClick={onClose}
               className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white text-sm font-medium rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Annuler
            </button>
            <button
               type="submit"
               disabled={loading}
               className="flex-1 px-4 py-2 bg-green-500 text-white text-sm font-medium rounded hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
