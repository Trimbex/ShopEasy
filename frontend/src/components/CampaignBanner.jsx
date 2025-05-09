'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { campaignsApi } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const CampaignBanner = () => {
  const [activeCampaigns, setActiveCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentCampaignIndex, setCurrentCampaignIndex] = useState(0);

  useEffect(() => {
    const fetchActiveCampaigns = async () => {
      try {
        setLoading(true);
        const campaigns = await campaignsApi.getActive();
        setActiveCampaigns(campaigns);
        setError(null);
      } catch (err) {
        console.error('Error fetching active campaigns:', err);
        setError('Failed to load campaigns');
      } finally {
        setLoading(false);
      }
    };

    fetchActiveCampaigns();
  }, []);

  // Rotate through campaigns every 7 seconds if there are multiple
  useEffect(() => {
    if (activeCampaigns.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentCampaignIndex((prevIndex) => 
        prevIndex === activeCampaigns.length - 1 ? 0 : prevIndex + 1
      );
    }, 7000);

    return () => clearInterval(interval);
  }, [activeCampaigns.length]);

  if (loading) return null; // Don't show anything while loading
  if (error || activeCampaigns.length === 0) return null; // Don't show if there's an error or no campaigns

  const campaign = activeCampaigns[currentCampaignIndex];

  // Validate campaign before rendering
  if (!campaign || !campaign.coupons || campaign.coupons.length === 0) return null;

  // Calculate brightness of the background color to determine text color
  const getContrastColor = (hexColor) => {
    // Remove the hash if it exists
    const color = hexColor.replace('#', '');
    
    // Parse the RGB values
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    
    // Calculate perceived brightness using the formula
    // (299*R + 587*G + 114*B) / 1000
    const brightness = (299 * r + 587 * g + 114 * b) / 1000;
    
    // Return white for dark backgrounds, black for light backgrounds
    return brightness < 128 ? '#ffffff' : '#000000';
  };

  // Get the text color based on background color
  const textColor = getContrastColor(campaign.color || '#6366F1');
  
  // Format min price as dollars
  const formatPrice = (price) => {
    return `$${Number(price).toFixed(2)}`;
  };

  // Calculate a slightly darker shade for the background pattern
  const getDarkerShade = (hexColor) => {
    const color = hexColor.replace('#', '');
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    
    // Darken by 10%
    const darkenFactor = 0.1;
    const darkerR = Math.max(0, Math.floor(r * (1 - darkenFactor)));
    const darkerG = Math.max(0, Math.floor(g * (1 - darkenFactor)));
    const darkerB = Math.max(0, Math.floor(b * (1 - darkenFactor)));
    
    return `#${darkerR.toString(16).padStart(2, '0')}${darkerG.toString(16).padStart(2, '0')}${darkerB.toString(16).padStart(2, '0')}`;
  };

  const darkerShade = getDarkerShade(campaign.color || '#6366F1');

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key={campaign.id}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.5 }}
        className="w-full py-4 md:py-5 px-4 text-center relative overflow-hidden"
        style={{ 
          backgroundColor: campaign.color || '#6366F1',
          color: textColor,
          backgroundImage: `radial-gradient(circle at 20% 50%, ${darkerShade}22 0%, transparent 20%), 
                           radial-gradient(circle at 80% 30%, ${darkerShade}22 0%, transparent 20%)`,
          backgroundSize: '60px 60px',
          boxShadow: 'rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px'
        }}
      >
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-6">
            <motion.div 
              className="relative"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <span className="font-bold text-xl md:text-2xl tracking-wide uppercase font-serif"
                    style={{
                      textShadow: `1px 1px 0 ${darkerShade}`,
                      letterSpacing: '0.075em'
                    }}>
                {campaign.name}
              </span>
              <div className="h-0.5 w-full mt-1 rounded-full" 
                   style={{ background: `linear-gradient(90deg, transparent, ${textColor}, transparent)` }}></div>
            </motion.div>
            
            <div className="flex flex-wrap gap-2 justify-center">
              {campaign.coupons.map((coupon, index) => (
                <motion.span 
                  key={coupon.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index, duration: 0.3 }}
                  className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium"
                  style={{ 
                    backgroundColor: `${textColor}15`, // 15% opacity of the text color
                    border: `1px solid ${textColor}30`, // 30% opacity border
                    backdropFilter: 'blur(8px)'
                  }}
                >
                  <span className="font-mono font-bold mr-1">{coupon.alias}</span>: 
                  <span className="font-bold ml-1">{coupon.percentDiscount}% OFF</span>
                  {coupon.minPrice > 0 && (
                    <span className="ml-1 text-xs opacity-80">
                      (min {formatPrice(coupon.minPrice)})
                    </span>
                  )}
                </motion.span>
              ))}
            </div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                href="/products" 
                className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-black text-white hover:bg-gray-800 transition-all"
                style={{ 
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                }}
              >
                Shop Now <span className="ml-1 text-lg" aria-hidden="true">→</span>
              </Link>
            </motion.div>
          </div>

          {activeCampaigns.length > 1 && (
            <div className="flex justify-center mt-3 gap-1.5">
              {activeCampaigns.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentCampaignIndex(index)}
                  className={`h-2 transition-all rounded-full ${
                    index === currentCampaignIndex ? 'w-6 bg-current opacity-90' : 'w-2 bg-current opacity-40 hover:opacity-60'
                  }`}
                  style={{ backgroundColor: textColor }}
                  aria-label={`Go to campaign ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Decorative elements */}
        <div 
          className="absolute top-0 left-0 w-full h-full opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='${textColor.replace('#', '%23')}' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            pointerEvents: 'none'
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default CampaignBanner; 