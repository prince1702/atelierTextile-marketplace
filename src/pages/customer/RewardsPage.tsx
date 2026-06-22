import React from 'react';
import { useNotification } from '../../contexts/NotificationContext';

export function RewardsPage() {
  const { showToast } = useNotification();
  
  const couponOptions = [
    { code: 'ATELIER15', desc: '15% Off any Extended License', cost: 350 },
    { code: 'BUYOUT200', desc: '$200 Off any Exclusive Buyout', cost: 800 },
    { code: 'ARTISANFREE', desc: 'Free Standard License of $490 or less', cost: 1200 },
  ];

  const handleClaim = (code: string, cost: number) => {
    showToast(`Claimed coupon ${code}! Spent ${cost} points. Code: ${code}`, 'success');
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h2 className="text-2xl font-bold text-primary mb-1">Rewards Center</h2>
        <p className="text-sm text-on-surface-variant">Earn points with every purchase and redeem them for premium licensing discounts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Balance */}
        <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <span className="material-symbols-outlined text-[36px] text-secondary-container mb-2 filled">stars</span>
            <p className="text-xs text-on-surface-variant uppercase font-semibold tracking-wider">Available Balance</p>
            <h3 className="text-4xl font-bold text-on-surface mt-1">1,250 <span className="text-sm font-semibold text-on-surface-variant">pts</span></h3>
          </div>
          <p className="text-[11px] text-on-surface-variant mt-4">Expires June 2027 • Earned 350 pts this month</p>
        </div>

        {/* Card 2: Tier */}
        <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <span className="material-symbols-outlined text-[36px] text-primary mb-2 filled">workspace_premium</span>
            <p className="text-xs text-on-surface-variant uppercase font-semibold tracking-wider">Membership Tier</p>
            <h3 className="text-xl font-bold text-on-surface mt-1">Gold Atelier Member</h3>
          </div>
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-xs text-on-surface-variant">
              <span>Progress to Platinum</span>
              <span>1,250 / 2,500 pts</span>
            </div>
            <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: '50%' }}></div>
            </div>
          </div>
        </div>

        {/* Card 3: Referrals */}
        <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <span className="material-symbols-outlined text-[36px] text-tertiary mb-2">share</span>
            <p className="text-xs text-on-surface-variant uppercase font-semibold tracking-wider">Referral Code</p>
            <h3 className="text-lg font-bold text-on-surface mt-1">ATELIER-REF-MREED</h3>
          </div>
          <button 
            onClick={() => { navigator.clipboard.writeText('ATELIER-REF-MREED'); showToast('Referral code copied to clipboard!', 'success'); }}
            className="w-full mt-4 py-2 border border-outline-variant hover:border-primary rounded-lg text-xs font-semibold text-primary transition-colors flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">content_copy</span>
            Copy Referral Code
          </button>
        </div>

      </div>

      {/* Rewards Coupon List */}
      <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-primary text-lg mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined">redeem</span>
          Redeem Reward Coupons
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {couponOptions.map(coupon => (
            <div key={coupon.code} className="border border-outline-variant rounded-xl p-5 hover:border-primary/30 transition-all flex flex-col justify-between bg-surface/10">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="font-mono bg-primary-fixed text-primary text-xs font-bold px-2 py-0.5 rounded">{coupon.code}</span>
                  <span className="text-xs font-bold text-secondary">{coupon.cost} pts</span>
                </div>
                <p className="text-sm font-semibold text-on-surface mt-2">{coupon.desc}</p>
              </div>
              <button 
                onClick={() => handleClaim(coupon.code, coupon.cost)}
                className="w-full mt-6 py-2 bg-secondary-container hover:bg-secondary text-white font-bold rounded-lg text-xs transition-colors"
              >
                Claim Reward
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
