"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Users, Download, Lock, Key, ChevronRight } from "lucide-react";

interface WaitlistEntry {
  id: string;
  email: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [secretKey, setSecretKey] = useState("");
  const [secretError, setSecretError] = useState("");
  
  const [data, setData] = useState<WaitlistEntry[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Simple local login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretKey) return;
    
    // We try to authenticate by attempting to fetch the count
    fetchData(secretKey);
  };

  const fetchData = async (key: string) => {
    setLoading(true);
    setSecretError("");
    setError("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/waitlist/all`, {
        headers: {
          "Authorization": `Bearer ${key}`
        }
      });

      const result = await response.json();

      if (response.ok) {
        setIsAuthenticated(true);
        setData(result.data);
        setTotalCount(result.data.length);
        // Persist session if needed
        sessionStorage.setItem("admin_secret", key);
      } else {
        setIsAuthenticated(false);
        setSecretError("Invalid secret key or unauthorized.");
      }
    } catch (err) {
      setError("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedSecret = sessionStorage.getItem("admin_secret");
    if (savedSecret) {
      setSecretKey(savedSecret);
      fetchData(savedSecret);
    }
  }, []);

  const exportToCSV = () => {
    const csvContent = [
      ["ID", "Email", "Date Joined"],
      ...data.map(entry => [
        entry.id, 
        entry.email, 
        new Date(entry.createdAt).toLocaleString()
      ])
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `pocketwise_waitlist_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0F0D23]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md p-8 rounded-3xl relative overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(20px)"
          }}
        >
          {/* Decorative glow inside card */}
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4 border border-indigo-500/20">
              <Lock className="text-indigo-400" size={28} />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2 font-jakarta">Admin Access</h1>
            <p className="text-white/50 text-center text-sm">Enter the secret key to view waitlist data</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 relative z-10">
            <div className="relative">
              <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="password"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="Secret Key"
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-medium"
              />
            </div>
            
            {secretError && (
              <p className="text-red-400 text-sm mt-2">{secretError}</p>
            )}

            <button
              type="submit"
              disabled={loading || !secretKey}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  Access Dashboard
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0D23] font-jakarta pb-24">
      {/* Dashboard Header */}
      <header className="border-b border-white/10 bg-[#0F0D23]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
              <Users className="text-indigo-400" size={20} />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">Waitlist Dashboard</h1>
              <p className="text-white/50 text-xs">PocketWise Admin Central</p>
            </div>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-sm transition-all font-medium"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 mt-10">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl relative overflow-hidden group"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <p className="text-white/50 font-medium text-sm mb-2">Total Signups</p>
            <p className="text-4xl font-bold text-white tracking-tight">{totalCount.toLocaleString()}</p>
          </motion.div>
          {/* Add more metrics cards later if needed */}
        </div>

        {/* Data Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl overflow-hidden border border-white/10"
          style={{ background: "rgba(255,255,255,0.02)" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="py-4 px-6 text-xs font-semibold text-white/50 uppercase tracking-wider w-12">#</th>
                  <th className="py-4 px-6 text-xs font-semibold text-white/50 uppercase tracking-wider">Email Address</th>
                  <th className="py-4 px-6 text-xs font-semibold text-white/50 uppercase tracking-wider">Date Joined</th>
                </tr>
              </thead>
              <tbody>
                {loading && data.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-white/50">
                      <div className="flex flex-col items-center justify-center">
                        <Loader2 className="animate-spin mb-2" size={24} />
                        <span>Loading entries...</span>
                      </div>
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-white/50">
                      No waitlist entries yet.
                    </td>
                  </tr>
                ) : (
                  data.map((entry, index) => (
                    <tr 
                      key={entry.id} 
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-4 px-6 text-sm text-white/30 font-medium">
                        {data.length - index} {/* Assuming descending order */}
                      </td>
                      <td className="py-4 px-6 text-sm text-white">
                        {entry.email}
                      </td>
                      <td className="py-4 px-6 text-sm text-white/60">
                        {new Date(entry.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
