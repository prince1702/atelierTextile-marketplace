import React from 'react';
import { Link } from 'react-router-dom';

export function StatCard({ title, value, icon, trend, trendValue, colorClass, to, onClick }: any) {
  const CardContent = (
    <div className={`bg-white border border-outline-variant rounded-xl p-6 shadow-sm card-lift relative overflow-hidden group h-full ${
      to || onClick ? 'cursor-pointer hover:border-primary/50 hover:shadow-md transition-all' : ''
    }`}>
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl opacity-30 transition-colors group-hover:opacity-50 ${colorClass.bg}`}></div>
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1 flex items-center gap-1">
            {title}
            {(to || onClick) && <span className="material-symbols-outlined text-[14px] opacity-0 group-hover:opacity-100 transition-opacity text-primary">arrow_forward</span>}
          </p>
          <h3 className="text-3xl font-bold text-primary">{value}</h3>
        </div>
        <div className={`p-2 rounded-xl ${colorClass.iconBg} ${colorClass.iconText}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
      </div>
      <div className={`flex items-center gap-1.5 text-xs font-semibold relative z-10 ${trend === 'up' ? 'text-surface-tint' : trend === 'down' ? 'text-error' : 'text-on-surface-variant'}`}>
        <span className="material-symbols-outlined text-[16px]">
          {trend === 'up' ? 'trending_up' : trend === 'down' ? 'trending_down' : 'horizontal_rule'}
        </span>
        <span>{trendValue}</span>
      </div>
    </div>
  );

  if (to) {
    return <Link to={to} className="block no-underline h-full">{CardContent}</Link>;
  }

  if (onClick) {
    return <div onClick={onClick} className="block h-full">{CardContent}</div>;
  }

  return CardContent;
}
