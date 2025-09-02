import React from 'react';
import AvalancheAnalytics from '@/components/AvalancheAnalytics';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const AnalyticsPage = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1 py-8">
        <AvalancheAnalytics />
      </div>
      <Footer />
    </div>
  );
};

export default AnalyticsPage;
