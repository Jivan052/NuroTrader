import React, { useEffect, useState } from 'react';
import { motion } from "framer-motion";
import { 
  useAddress, 
  useBalance, 
  useChain, 
  useConnectionStatus, 
  useDisconnect,
  ConnectWallet
} from "@thirdweb-dev/react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Wallet, Copy, LogOut, Save, ArrowRight, RefreshCw, CheckCircle } from "lucide-react";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from "sonner";

interface Transaction {
  id: string;
  type: string;
  amount: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
}

const ProfilePage: React.FC = () => {
  // ThirdWeb hooks to manage wallet connection and data
  const address = useAddress();
  const connectionStatus = useConnectionStatus();
  const { data: balance } = useBalance();
  const chain = useChain();
  const disconnect = useDisconnect();

  // User profile state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    username: '',
    email: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isCopied, setIsCopied] = useState(false);

  const isConnected = connectionStatus === "connected" && address;

  // Mock transaction data - In production, fetch from your backend
  const mockTransactions: Transaction[] = [
    { id: '1', type: 'Swap', amount: '0.5 ETH → 1250 USDT', timestamp: '2025-09-01T14:30:00Z', status: 'completed' },
    { id: '2', type: 'Stake', amount: '100 AVAX', timestamp: '2025-08-30T09:15:00Z', status: 'completed' },
    { id: '3', type: 'Transfer', amount: '0.1 ETH', timestamp: '2025-08-25T16:45:00Z', status: 'completed' },
    { id: '4', type: 'Mint NFT', amount: '0.05 ETH', timestamp: '2025-08-20T11:22:00Z', status: 'completed' },
  ];

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

  // Copy wallet address to clipboard
  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      toast.success("Address copied to clipboard");
    }
  };

  // Format address for display
  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  // Fetch user profile from backend
  const fetchUserProfile = async () => {
    if (!address) return;

    setIsLoading(true);
    try {
      // In production, replace with actual API call
      const response = await fetch(`http://localhost:3002/api/users/profile?walletAddress=${address}`);
      
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data);
        setProfileForm({
          username: data.username || '',
          email: data.email || '',
        });
      } else {
        // If user not found, create mock data
        setUserProfile({
          id: address,
          username: '',
          email: '',
          avatarUrl: '',
        });
      }
      
      // In a real app, fetch actual transactions
      setTransactions(mockTransactions);
      
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      toast.error("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle profile form submission
  const saveProfile = async () => {
    if (!address) return;
    
    setIsLoading(true);
    try {
      // In production, replace with actual API call
      const response = await fetch('http://localhost:3002/api/users/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: address,
          username: profileForm.username,
          email: profileForm.email,
        }),
      });
      
      if (response.ok) {
        const updatedProfile = await response.json();
        setUserProfile({
          ...userProfile!,
          username: updatedProfile.username,
          email: updatedProfile.email,
        });
        setIsEditingProfile(false);
        toast.success("Profile updated successfully");
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value,
    });
  };

  // Fetch profile when wallet is connected
  useEffect(() => {
    if (isConnected) {
      fetchUserProfile();
    }
  }, [isConnected, address]);

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
            <h1 className="text-3xl font-bold mb-8 text-center">User Profile</h1>

            {/* Connect Wallet Section (shown when not connected) */}
            {!isConnected && (
              <Card className="max-w-2xl mx-auto mb-8 glass border-primary/20">
                <CardHeader>
                  <CardTitle>Connect Your Wallet</CardTitle>
                  <CardDescription>
                    Connect your wallet to view your profile and transaction history
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center py-10">
                  <ConnectWallet 
                    theme="dark"
                    btnTitle="Connect Wallet"
                    modalSize="wide"
                    welcomeScreen={{
                      title: "NeuroTrader Profile",
                      subtitle: "Connect your wallet to access your personalized profile",
                    }}
                    modalTitle="Connect Your Wallet"
                  />
                </CardContent>
              </Card>
            )}

            {/* Profile Section (shown when connected) */}
            {isConnected && (
              <div className="grid gap-8 md:grid-cols-3">
                {/* Left column - Wallet & Profile Info */}
                <Card className="md:col-span-1 glass border-primary/20">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Wallet</CardTitle>
                      <Badge variant="outline" className="bg-primary/10">
                        {chain?.name || "Unknown Network"}
                      </Badge>
                    </div>
                    <CardDescription>Your connected wallet and balance</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-center mb-6">
                      <Avatar className="h-24 w-24 border-2 border-primary/50">
                        <AvatarImage src={`https://effigy.im/a/${address}.svg`} />
                        <AvatarFallback className="bg-primary/20">
                          <Wallet className="h-10 w-10 text-primary/70" />
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Address</div>
                      <div className="flex items-center justify-between bg-background/30 rounded-lg p-3 border border-border">
                        <span className="text-sm font-mono">{formatAddress(address!)}</span>
                        <Button variant="ghost" size="icon" onClick={copyAddress} className="h-8 w-8">
                          {isCopied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Balance</div>
                      <div className="bg-background/30 rounded-lg p-3 border border-border">
                        <div className="text-xl font-bold text-primary">
                          {balance ? 
                            `${parseFloat(balance.displayValue).toFixed(4)} ${balance.symbol}` : 
                            "0.0000 ETH"
                          }
                        </div>
                      </div>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <Button 
                      variant="destructive" 
                      className="w-full flex items-center justify-center gap-2"
                      onClick={disconnect}
                    >
                      <LogOut className="h-4 w-4" />
                      Disconnect Wallet
                    </Button>
                  </CardContent>
                </Card>

                {/* Right column - User Info & Transactions */}
                <Card className="md:col-span-2 glass border-primary/20">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Account Details</CardTitle>
                      {!isEditingProfile ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setIsEditingProfile(true)}
                        >
                          Edit Profile
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setIsEditingProfile(false)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                    <CardDescription>Your account information and transactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="profile">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="transactions">Transactions</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="profile" className="pt-6">
                        {isLoading ? (
                          <div className="flex justify-center py-10">
                            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                          </div>
                        ) : isEditingProfile ? (
                          <div className="space-y-4">
                            <div>
                              <label htmlFor="username" className="text-sm font-medium mb-2 block">
                                Username
                              </label>
                              <Input 
                                id="username"
                                name="username"
                                value={profileForm.username}
                                onChange={handleFormChange}
                                placeholder="Enter your username"
                              />
                            </div>
                            <div>
                              <label htmlFor="email" className="text-sm font-medium mb-2 block">
                                Email
                              </label>
                              <Input 
                                id="email"
                                name="email"
                                type="email"
                                value={profileForm.email}
                                onChange={handleFormChange}
                                placeholder="Enter your email"
                              />
                            </div>
                            <Button 
                              className="w-full flex items-center justify-center gap-2 mt-4" 
                              onClick={saveProfile}
                              disabled={isLoading}
                            >
                              {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                              Save Changes
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            <div className="space-y-1">
                              <h4 className="text-sm font-medium text-muted-foreground">Username</h4>
                              <p className="text-lg">{userProfile?.username || "Not set"}</p>
                            </div>
                            <div className="space-y-1">
                              <h4 className="text-sm font-medium text-muted-foreground">Email</h4>
                              <p className="text-lg">{userProfile?.email || "Not set"}</p>
                            </div>
                            <div className="space-y-1">
                              <h4 className="text-sm font-medium text-muted-foreground">Wallet Connected</h4>
                              <p className="text-lg">{formatDate(new Date().toISOString())}</p>
                            </div>
                          </div>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="transactions" className="pt-6">
                        {isLoading ? (
                          <div className="flex justify-center py-10">
                            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                          </div>
                        ) : transactions.length > 0 ? (
                          <div className="space-y-4">
                            {transactions.map((tx) => (
                              <div 
                                key={tx.id} 
                                className="flex items-center justify-between p-4 rounded-lg bg-background/30 border border-border"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="rounded-full bg-primary/20 p-2">
                                    <ArrowRight className="h-4 w-4 text-primary" />
                                  </div>
                                  <div>
                                    <p className="font-medium">{tx.type}</p>
                                    <p className="text-sm text-muted-foreground">{formatDate(tx.timestamp)}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium">{tx.amount}</p>
                                  <Badge 
                                    variant={tx.status === 'completed' ? 'default' : 
                                           tx.status === 'pending' ? 'outline' : 'destructive'}
                                    className="text-xs"
                                  >
                                    {tx.status}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-10">
                            <p className="text-muted-foreground">No transactions found</p>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;
