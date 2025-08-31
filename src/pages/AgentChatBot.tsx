import React from 'react';
import CryptoAnalysisChatbot from '../components/CryptoAnalysisChatbot';

const AgentChatbot = () => {
  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-silver-bright mb-8">AI Crypto Assistant</h1>
        <p className="text-silver mb-8">
          Interact with the NeuroTrader AI Assistant to analyze market trends, get cryptocurrency insights, 
          and receive trading recommendations - powered by our API with real-time CoinGecko data.
        </p>
        <CryptoAnalysisChatbot />
      </div>
    </div>
  );
}

export default AgentChatbot;