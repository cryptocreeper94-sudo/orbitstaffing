import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Download, ExternalLink, CheckCircle2, Shield, Database } from 'lucide-react';
import { useLocation } from 'wouter';

interface HallmarkRecord {
  id: string;
  hallmarkNumber: string;
  assetType: string;
  recipientName: string;
  recipientRole: string;
  createdAt: string;
  metadata: any;
}

export default function HallmarkRegistry() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<HallmarkRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, byType: {} });

  useEffect(() => {
    // Load stats on mount
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/hallmarks/stats');
      if (res.ok) {
        setStats(await res.json());
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/hallmarks/search?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        setResults(await res.json());
      }
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async () => {
    try {
      const res = await fetch('/api/hallmarks/export');
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ORBIT-Hallmarks-${new Date().toISOString()}.csv`;
        a.click();
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-cyan-300 flex items-center gap-2">
            <Shield className="w-8 h-8" />
            ORBIT Hallmark Registry
          </h1>
          <Button
            onClick={() => setLocation('/admin')}
            variant="outline"
            className="text-slate-300"
            data-testid="button-back-to-admin"
          >
            Back to Admin
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-800 border border-slate-700">
            <CardContent className="pt-6">
              <p className="text-slate-400 text-sm">Total Assets Cataloged</p>
              <p className="text-3xl font-bold text-cyan-300">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border border-slate-700">
            <CardContent className="pt-6">
              <p className="text-slate-400 text-sm">Letters</p>
              <p className="text-3xl font-bold text-amber-300">{(stats.byType as any)?.letter || 0}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border border-slate-700">
            <CardContent className="pt-6">
              <p className="text-slate-400 text-sm">Invoices & Reports</p>
              <p className="text-3xl font-bold text-green-300">
                {((stats.byType as any)?.invoice || 0) + ((stats.byType as any)?.report || 0)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="bg-slate-800 border border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-300">
              <Search className="w-5 h-5" />
              Search Hallmarks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by hallmark number, name, or asset type..."
                  className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400"
                  data-testid="input-hallmark-search"
                />
                <Button
                  type="submit"
                  className="bg-cyan-600 hover:bg-cyan-700"
                  data-testid="button-search-hallmarks"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </form>

            {/* Export */}
            <div className="mt-4 pt-4 border-t border-slate-600">
              <Button
                onClick={downloadReport}
                variant="outline"
                className="text-slate-300"
                data-testid="button-export-hallmarks"
              >
                <Download className="w-4 h-4 mr-2" />
                Export All Records (CSV)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {results.length > 0 && (
          <Card className="bg-slate-800 border border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Found {results.length} record{results.length !== 1 ? 's' : ''}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {results.map((record) => (
                  <div
                    key={record.id}
                    className="p-4 bg-slate-700 rounded border border-slate-600 hover:border-cyan-500 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <code className="text-cyan-300 font-mono font-bold">{record.hallmarkNumber}</code>
                          <span className="text-xs px-2 py-1 bg-slate-600 rounded text-slate-300">
                            {record.assetType}
                          </span>
                        </div>
                        <p className="text-slate-200 font-semibold">{record.recipientName}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(record.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {searchQuery && !loading && results.length === 0 && (
          <Card className="bg-slate-800 border border-slate-700">
            <CardContent className="pt-6">
              <p className="text-slate-400 text-center">No hallmarks found matching your search.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
