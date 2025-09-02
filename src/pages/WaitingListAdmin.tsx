import React, { useEffect, useState } from 'react';
import { motion } from "framer-motion";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Search, Download, RefreshCw, UserCheck, UserX } from "lucide-react";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from "sonner";

interface WaitlistEntry {
  id: number;
  wallet_address: string;
  name: string;
  email: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

const WaitingListAdmin: React.FC = () => {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<WaitlistEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isUpdating, setIsUpdating] = useState<Record<number, boolean>>({});

  // Fetch waitlist entries
  const fetchEntries = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3002/api/admin/waitlist');
      
      if (response.ok) {
        const data = await response.json();
        setEntries(data.entries);
        setFilteredEntries(data.entries);
      } else {
        toast.error("Failed to fetch waitlist entries");
      }
    } catch (error) {
      console.error("Error fetching waitlist entries:", error);
      toast.error("Error fetching waitlist entries");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchEntries();
  }, []);

  // Filter entries based on search query and status filter
  useEffect(() => {
    let results = entries;
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(entry => 
        entry.name.toLowerCase().includes(query) ||
        entry.email.toLowerCase().includes(query) ||
        entry.wallet_address.toLowerCase().includes(query) ||
        entry.reason?.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      results = results.filter(entry => entry.status === statusFilter);
    }
    
    setFilteredEntries(results);
  }, [searchQuery, statusFilter, entries]);

  // Update entry status
  const updateStatus = async (id: number, newStatus: 'pending' | 'approved' | 'rejected') => {
    setIsUpdating(prev => ({ ...prev, [id]: true }));
    
    try {
      const response = await fetch(`http://localhost:3002/api/admin/waitlist/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        // Update local state
        setEntries(prev => 
          prev.map(entry => 
            entry.id === id ? { ...entry, status: newStatus } : entry
          )
        );
        
        toast.success(`Status updated to ${newStatus}`);
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Error updating status");
    } finally {
      setIsUpdating(prev => ({ ...prev, [id]: false }));
    }
  };

  // Export waitlist to CSV
  const exportToCsv = () => {
    const headers = ["ID", "Name", "Email", "Wallet Address", "Reason", "Status", "Created At"];
    const csvData = [
      headers.join(','),
      ...filteredEntries.map(entry => [
        entry.id,
        `"${entry.name.replace(/"/g, '""')}"`,
        `"${entry.email.replace(/"/g, '""')}"`,
        entry.wallet_address,
        `"${(entry.reason || '').replace(/"/g, '""')}"`,
        entry.status,
        entry.created_at
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'waitlist-export.csv';
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success("Waitlist exported successfully");
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30">
            <CheckCircle className="mr-1 h-3 w-3" /> Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-500/20 text-red-500 hover:bg-red-500/30">
            <XCircle className="mr-1 h-3 w-3" /> Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">
            <Clock className="mr-1 h-3 w-3" /> Pending
          </Badge>
        );
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-16 pb-8">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">Waiting List Management</h1>
                <p className="text-muted-foreground">
                  Manage and approve users who have registered interest in NeuroTrader
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchEntries} 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={exportToCsv} 
                  disabled={isLoading || filteredEntries.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>

            <Card className="mb-8 glass border-primary/20">
              <CardHeader className="pb-4">
                <CardTitle>Waitlist Overview</CardTitle>
                <CardDescription>
                  A summary of current registrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Registrations</p>
                      <p className="text-2xl font-bold">{entries.length}</p>
                    </div>
                    <div className="rounded-full bg-primary/20 p-2">
                      <UserCheck className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Approved</p>
                      <p className="text-2xl font-bold">
                        {entries.filter(e => e.status === 'approved').length}
                      </p>
                    </div>
                    <div className="rounded-full bg-green-500/20 p-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <p className="text-2xl font-bold">
                        {entries.filter(e => e.status === 'pending').length}
                      </p>
                    </div>
                    <div className="rounded-full bg-yellow-500/20 p-2">
                      <Clock className="h-5 w-5 text-yellow-500" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, wallet address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card className="glass border-primary/20 overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Wallet Address</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Registered</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-10">
                            <div className="flex justify-center">
                              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                            </div>
                            <p className="text-muted-foreground mt-2">Loading entries...</p>
                          </TableCell>
                        </TableRow>
                      ) : filteredEntries.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-10">
                            <p className="text-muted-foreground">No entries found</p>
                            {searchQuery && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Try adjusting your search query
                              </p>
                            )}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredEntries.map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell className="font-medium">{entry.name}</TableCell>
                            <TableCell>{entry.email}</TableCell>
                            <TableCell className="font-mono text-xs">
                              {`${entry.wallet_address.substring(0, 8)}...${entry.wallet_address.substring(entry.wallet_address.length - 6)}`}
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {entry.reason || "-"}
                            </TableCell>
                            <TableCell>{formatDate(entry.created_at)}</TableCell>
                            <TableCell>{getStatusBadge(entry.status)}</TableCell>
                            <TableCell className="text-right">
                              {entry.status !== 'approved' && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => updateStatus(entry.id, 'approved')}
                                  disabled={isUpdating[entry.id]}
                                  className="text-green-500 hover:text-green-600 hover:bg-green-500/10"
                                >
                                  {isUpdating[entry.id] ? (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                              {entry.status !== 'rejected' && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => updateStatus(entry.id, 'rejected')}
                                  disabled={isUpdating[entry.id]}
                                  className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                >
                                  {isUpdating[entry.id] ? (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <XCircle className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                              {entry.status !== 'pending' && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => updateStatus(entry.id, 'pending')}
                                  disabled={isUpdating[entry.id]}
                                  className="text-yellow-500 hover:text-yellow-600 hover:bg-yellow-500/10"
                                >
                                  {isUpdating[entry.id] ? (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Clock className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WaitingListAdmin;
