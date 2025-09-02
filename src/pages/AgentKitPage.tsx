import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AgentKitChat from '@/components/AgentKitChat';

const AgentKitPage: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pt-20 pb-10">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8 text-center">Blockchain Agent</h1>
          <div className="mx-auto">
            <AgentKitChat />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AgentKitPage;
