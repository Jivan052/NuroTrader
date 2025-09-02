import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Wallet, 
  Activity, 
  Layers, 
  BarChart, 
  TrendingUp, 
  TrendingDown,
  Globe,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Server,
  Zap,
  Hexagon
} from 'lucide-react';
import config from '@/config';

interface NetworkStats {
  avgBlockTime: number;
  gasPrice: number;
  activeValidators: number;
  totalStaked: number;
  currentEpoch: number;
  totalTransactions: number;
  tps: number;
}

interface MarketData {
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  circulatingSupply: number;
}

interface DefiStats {
  tvl: number;
  activeDapps: number;
  topProtocols: { name: string; tvl: number }[];
}

interface Subnet {
  name: string;
  type: string;
  status: string;
  blockHeight: number;
}

interface RecentActivity {
  type: string;
  name: string;
  timestamp: string;
}

interface AvalancheAnalytics {
  networkStats: NetworkStats;
  marketData: MarketData;
  defiStats: DefiStats;
  subnets: Subnet[];
  recentActivity: RecentActivity[];
  timestamp: string;
}

const AvalancheAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AvalancheAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch Avalanche analytics data
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${config.apiUrl}/api/analytics/avalanche/basic`);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      setAnalytics(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching Avalanche analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };
  
  // Load data on component mount
  useEffect(() => {
    fetchAnalytics();
  }, []);
  
  // Format large numbers
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: num > 1000000 ? 'compact' : 'standard',
      maximumFractionDigits: 2
    }).format(num);
  };
  
  // Format currency
  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: num > 1000000 ? 'compact' : 'standard',
      maximumFractionDigits: 2
    }).format(num);
  };
  
  // Format time ago
  const timeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} days ago`;
    const months = Math.floor(days / 30);
    return `${months} months ago`;
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-silver-bright flex items-center">
            <Hexagon className="mr-2 h-6 w-6 text-red-500" />
            Avalanche Analytics
          </h2>
          <p className="text-muted-foreground mt-1">
            Real-time network and market insights for Avalanche
          </p>
        </div>
        
        <div className="mt-3 md:mt-0 flex items-center">
          {lastUpdated && (
            <div className="text-xs text-muted-foreground flex items-center mr-3">
              <Clock className="mr-1 h-3 w-3" />
              Updated {timeAgo(lastUpdated.toISOString())}
            </div>
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchAnalytics}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
      
      {error && (
        <Card className="mb-6 border-red-500/20 bg-red-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center text-red-400">
              <TrendingDown className="mr-2 h-5 w-5" />
              <span>Error loading analytics: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market Data Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-primary/20 bg-black/40">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart className="mr-2 h-5 w-5 text-primary" />
                Market Overview
              </CardTitle>
              <CardDescription>
                AVAX token price and market metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading || !analytics ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <div className="flex items-end">
                      <span className="text-3xl font-bold text-silver-bright">
                        ${analytics.marketData.price.toFixed(2)}
                      </span>
                      <div className={`ml-3 flex items-center ${
                        analytics.marketData.change24h >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {analytics.marketData.change24h >= 0 ? (
                          <ArrowUpRight className="mr-1 h-4 w-4" />
                        ) : (
                          <ArrowDownRight className="mr-1 h-4 w-4" />
                        )}
                        <span className="font-semibold">
                          {Math.abs(analytics.marketData.change24h).toFixed(2)}%
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">24h</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Market Cap</div>
                      <div className="font-medium">{formatCurrency(analytics.marketData.marketCap)}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">24h Volume</div>
                      <div className="font-medium">{formatCurrency(analytics.marketData.volume24h)}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Circulating Supply</div>
                      <div className="font-medium">{formatNumber(analytics.marketData.circulatingSupply)} AVAX</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Total Staked</div>
                      <div className="font-medium">{formatNumber(analytics.networkStats.totalStaked)} AVAX</div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Network Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border-primary/20 bg-black/40">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Server className="mr-2 h-5 w-5 text-primary" />
                Network Stats
              </CardTitle>
              <CardDescription>
                Avalanche blockchain performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading || !analytics ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-6">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Block Time</div>
                    <div className="font-medium flex items-center">
                      <Clock className="mr-1 h-3 w-3 text-primary" />
                      {analytics.networkStats.avgBlockTime.toFixed(1)}s
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">TPS</div>
                    <div className="font-medium flex items-center">
                      <Zap className="mr-1 h-3 w-3 text-primary" />
                      {analytics.networkStats.tps.toFixed(1)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Gas Price</div>
                    <div className="font-medium">{analytics.networkStats.gasPrice} nAVAX</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Active Validators</div>
                    <div className="font-medium">{formatNumber(analytics.networkStats.activeValidators)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Current Epoch</div>
                    <div className="font-medium">{formatNumber(analytics.networkStats.currentEpoch)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Total Transactions</div>
                    <div className="font-medium">{formatNumber(analytics.networkStats.totalTransactions)}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        {/* DeFi Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="border-primary/20 bg-black/40">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5 text-primary" />
                DeFi Ecosystem
              </CardTitle>
              <CardDescription>
                Decentralized finance activity on Avalanche
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading || !analytics ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="text-xs text-muted-foreground">Total Value Locked</div>
                      <div className="text-2xl font-bold text-silver-bright">
                        {formatCurrency(analytics.defiStats.tvl)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Active dApps</div>
                      <div className="text-xl font-semibold text-silver-bright text-center">
                        {analytics.defiStats.activeDapps}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="text-xs text-muted-foreground">Top Protocols by TVL</div>
                    {analytics.defiStats.topProtocols.map((protocol, index) => (
                      <div key={protocol.name} className="flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="text-xs bg-primary/20 text-primary h-5 w-5 rounded-full flex items-center justify-center mr-2">
                            {index + 1}
                          </span>
                          <span className="font-medium">{protocol.name}</span>
                        </div>
                        <span>{formatCurrency(protocol.tvl)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Subnets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="border-primary/20 bg-black/40">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Layers className="mr-2 h-5 w-5 text-primary" />
                Subnet Activity
              </CardTitle>
              <CardDescription>
                Avalanche subnet performance and status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading || !analytics ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {analytics.subnets.map((subnet) => (
                    <div key={subnet.name} className="flex items-center justify-between p-2 rounded-md bg-black/20">
                      <div>
                        <div className="font-medium">{subnet.name}</div>
                        <div className="text-xs text-muted-foreground">{subnet.type}</div>
                      </div>
                      <div className="flex items-center">
                        <Badge variant={subnet.status === 'Active' ? 'default' : 'outline'} className="mr-2">
                          {subnet.status}
                        </Badge>
                        <div className="text-xs text-right">
                          <div>Height: {formatNumber(subnet.blockHeight)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="mt-4">
                    <Button variant="outline" size="sm" className="w-full">
                      View All Subnets
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AvalancheAnalytics;
