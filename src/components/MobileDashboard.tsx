import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PriceChart } from './charts/PriceChart';
import { VolumeChart } from './charts/VolumeChart';
import { ActiveAddressesChart } from './charts/ActiveAddressesChart';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

type MobileDashboardProps = {
  token?: string;
  network?: string;
};

const MobileDashboard: React.FC<MobileDashboardProps> = ({ 
  token = 'ethereum', 
  network = 'ethereum' 
}) => {
  const [timeframe, setTimeframe] = useState<string>('24h');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  
  const dashboardItems = [
    {
      title: "Price Action",
      chart: <PriceChart token={token} timeframe={timeframe} />,
      description: "Token price movement over time"
    },
    {
      title: "Trading Volume",
      chart: <VolumeChart token={token} />,
      description: "Daily trading volume"
    },
    {
      title: "Network Activity",
      chart: <ActiveAddressesChart network={network} timeframe={timeframe} />,
      description: "Active and new addresses"
    }
  ];
  
  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? dashboardItems.length - 1 : prev - 1));
  };
  
  const handleNext = () => {
    setCurrentIndex((prev) => (prev === dashboardItems.length - 1 ? 0 : prev + 1));
  };
  
  const currentItem = dashboardItems[currentIndex];
  
  return (
    <div className="w-full sm:hidden">
      <Card className="border border-primary/10">
        <CardHeader className="p-4 pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{currentItem.title}</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handlePrevious}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground">
                {currentIndex + 1}/{dashboardItems.length}
              </span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{currentItem.description}</p>
          
          <div className="mt-3 flex justify-center">
            <Tabs defaultValue={timeframe} onValueChange={setTimeframe} className="w-full">
              <TabsList className="grid grid-cols-3 h-7">
                <TabsTrigger value="24h" className="text-xs py-0 h-6">24H</TabsTrigger>
                <TabsTrigger value="7d" className="text-xs py-0 h-6">7D</TabsTrigger>
                <TabsTrigger value="30d" className="text-xs py-0 h-6">30D</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        
        <CardContent className="p-2 pt-3">
          <div className="h-56 w-full">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
            >
              {currentItem.chart}
            </motion.div>
          </div>
          
          <div className="mt-2 flex justify-center">
            <Button variant="ghost" size="sm" className="text-xs h-7">
              <ExternalLink className="mr-1 h-3 w-3" />
              View Full Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileDashboard;
