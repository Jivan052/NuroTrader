import React, { useEffect, useRef } from 'react';

type SentimentGaugeProps = {
  sentiment: number;  // -100 to 100
};

export const SentimentGauge: React.FC<SentimentGaugeProps> = ({ sentiment }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Scale for high-DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);
    
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    const centerX = width / 2;
    const centerY = height * 0.6;  // Position gauge slightly lower
    const radius = Math.min(width, height) * 0.4;
    
    // Draw the gauge background (semi-circle)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, 0, false);
    
    // Create gradient for gauge background
    const gradient = ctx.createLinearGradient(0, centerY, width, centerY);
    gradient.addColorStop(0, "rgba(239, 68, 68, 0.5)");     // Red (negative)
    gradient.addColorStop(0.5, "rgba(245, 158, 11, 0.5)");  // Yellow (neutral)
    gradient.addColorStop(1, "rgba(16, 185, 129, 0.5)");    // Green (positive)
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = radius * 0.2;
    ctx.stroke();
    
    // Calculate needle position
    // Convert sentiment from -100...100 to 0...1 for the gauge
    const needleValue = (sentiment + 100) / 200;
    const needleAngle = Math.PI - needleValue * Math.PI;
    
    // Draw the needle
    const needleLength = radius * 0.9;
    const needleWidth = radius * 0.05;
    
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(needleAngle);
    
    // Needle body
    ctx.beginPath();
    ctx.moveTo(0, -needleWidth);
    ctx.lineTo(needleLength, 0);
    ctx.lineTo(0, needleWidth);
    ctx.fillStyle = "hsl(var(--primary))";
    ctx.fill();
    
    // Needle center
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.1, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.strokeStyle = "hsl(var(--primary))";
    ctx.lineWidth = 1;
    ctx.stroke();
    
    ctx.restore();
    
    // Draw the value text
    ctx.font = `bold ${radius * 0.3}px sans-serif`;
    ctx.fillStyle = sentiment > 0 ? "rgba(16, 185, 129, 1)" : 
                   sentiment < 0 ? "rgba(239, 68, 68, 1)" : 
                   "rgba(245, 158, 11, 1)";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(`${Math.abs(sentiment).toFixed(1)}%`, centerX, centerY + radius * 0.3);
    
    // Add label text
    ctx.font = `${radius * 0.15}px sans-serif`;
    ctx.fillStyle = sentiment > 0 ? "rgba(16, 185, 129, 0.8)" : 
                   sentiment < 0 ? "rgba(239, 68, 68, 0.8)" : 
                   "rgba(245, 158, 11, 0.8)";
    ctx.fillText(sentiment > 0 ? "Bullish" : sentiment < 0 ? "Bearish" : "Neutral", centerX, centerY + radius * 0.6);
    
  }, [sentiment]);
  
  return (
    <div className="w-full h-full flex justify-center items-center">
      <canvas ref={canvasRef} className="w-full h-full"></canvas>
    </div>
  );
};
