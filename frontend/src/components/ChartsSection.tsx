import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { MonthlyTrend, CategoryBreakdownItem, UserBreakdownItem } from '../types';
import { TrendingUp, PieChart as PieIcon, Users, BarChart3, LineChart as LineChartIcon } from 'lucide-react';

interface ChartsSectionProps {
  monthlyTrends: MonthlyTrend[];
  categoryBreakdown: CategoryBreakdownItem[];
  userBreakdown: UserBreakdownItem[];
  loading: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  Revenue: '#10B981', // Emerald green
  Expense: '#F43F5E', // Coral rose
};

export const ChartsSection: React.FC<ChartsSectionProps> = ({
  monthlyTrends,
  categoryBreakdown,
  userBreakdown,
  loading,
}) => {
  const [trendChartType, setTrendChartType] = useState<'area' | 'bar'>('area');

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
    return `$${value}`;
  };

  // Custom Dark Tooltip
  const CustomTrendTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const rev = payload.find((p: any) => p.dataKey === 'revenue')?.value || 0;
      const exp = payload.find((p: any) => p.dataKey === 'expense')?.value || 0;
      const net = rev - exp;

      return (
        <div className="custom-chart-tooltip">
          <p className="tooltip-title">{label}</p>
          <div className="tooltip-row revenue">
            <span className="tooltip-dot green"></span>
            <span className="tooltip-label">Revenue:</span>
            <span className="tooltip-val">${rev.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="tooltip-row expense">
            <span className="tooltip-dot red"></span>
            <span className="tooltip-label">Expenses:</span>
            <span className="tooltip-val">${exp.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="tooltip-row net">
            <span className="tooltip-label">Net Profit:</span>
            <span className={`tooltip-val ${net >= 0 ? 'text-revenue' : 'text-expense'}`}>
              ${net.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Prepare category pie data
  const pieData = categoryBreakdown.map((item) => ({
    name: item._id,
    value: item.totalAmount,
    count: item.count,
  }));

  const totalCategoryAmount = pieData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="charts-grid">
      {/* 1. Monthly Trends Chart (Full / Primary) */}
      <div className="chart-card trend-chart-card">
        <div className="chart-header">
          <div className="chart-title-group">
            <div className="chart-icon-box">
              <TrendingUp size={18} />
            </div>
            <div>
              <h3 className="chart-title">Revenue vs Expenses Trends</h3>
              <p className="chart-desc">Monthly financial trajectory and cash flow balance</p>
            </div>
          </div>

          <div className="chart-type-toggle">
            <button
              type="button"
              className={`toggle-btn ${trendChartType === 'area' ? 'active' : ''}`}
              onClick={() => setTrendChartType('area')}
              title="Area Trend View"
            >
              <LineChartIcon size={15} />
              <span>Area</span>
            </button>
            <button
              type="button"
              className={`toggle-btn ${trendChartType === 'bar' ? 'active' : ''}`}
              onClick={() => setTrendChartType('bar')}
              title="Bar Comparison View"
            >
              <BarChart3 size={15} />
              <span>Bars</span>
            </button>
          </div>
        </div>

        <div className="chart-body" style={{ height: 290 }}>
          {loading ? (
            <div className="chart-loading-placeholder">
              <span className="loading-pulse">Calculating trend analytics...</span>
            </div>
          ) : monthlyTrends.length === 0 ? (
            <div className="chart-empty">No trend data available for selected filter</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {trendChartType === 'area' ? (
                <AreaChart data={monthlyTrends} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="expGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a324b" vertical={false} />
                  <XAxis dataKey="month" stroke="#717a94" fontSize={12} tickLine={false} />
                  <YAxis stroke="#717a94" fontSize={12} tickLine={false} tickFormatter={formatCurrency} />
                  <Tooltip content={<CustomTrendTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: 10 }} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#revGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    name="Expenses"
                    stroke="#F43F5E"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#expGradient)"
                  />
                </AreaChart>
              ) : (
                <BarChart data={monthlyTrends} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a324b" vertical={false} />
                  <XAxis dataKey="month" stroke="#717a94" fontSize={12} tickLine={false} />
                  <YAxis stroke="#717a94" fontSize={12} tickLine={false} tickFormatter={formatCurrency} />
                  <Tooltip content={<CustomTrendTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: 10 }} />
                  <Bar dataKey="revenue" name="Revenue" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Expenses" fill="#F43F5E" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 2. Category Breakdown (Donut Chart) */}
      <div className="chart-card category-chart-card">
        <div className="chart-header">
          <div className="chart-title-group">
            <div className="chart-icon-box">
              <PieIcon size={18} />
            </div>
            <div>
              <h3 className="chart-title">Category Breakdown</h3>
              <p className="chart-desc">Revenue vs Expense proportion</p>
            </div>
          </div>
        </div>

        <div className="chart-body" style={{ height: 210 }}>
          {loading ? (
            <div className="chart-loading-placeholder">
              <span className="loading-pulse">Loading breakdown...</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CATEGORY_COLORS[entry.name] || '#6366F1'}
                      stroke="#141a29"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => `$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                  contentStyle={{ backgroundColor: '#182033', borderColor: '#2e3b59', borderRadius: 8, color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="pie-legend-details">
          {pieData.map((item) => {
            const percent = totalCategoryAmount > 0 ? Math.round((item.value / totalCategoryAmount) * 100) : 0;
            return (
              <div key={item.name} className="legend-row">
                <div className="legend-left">
                  <span
                    className="legend-dot"
                    style={{ backgroundColor: CATEGORY_COLORS[item.name] || '#6366F1' }}
                  ></span>
                  <span className="legend-name">{item.name}</span>
                  <span className="legend-count">({item.count} txns)</span>
                </div>
                <div className="legend-right">
                  <span className="legend-amount">${(item.value / 1000).toFixed(1)}k</span>
                  <span className="legend-percent">{percent}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. User Volume & Performance Breakdown */}
      <div className="chart-card user-chart-card">
        <div className="chart-header">
          <div className="chart-title-group">
            <div className="chart-icon-box">
              <Users size={18} />
            </div>
            <div>
              <h3 className="chart-title">Analyst Activity Breakdown</h3>
              <p className="chart-desc">Revenue vs Expenses by user account</p>
            </div>
          </div>
        </div>

        <div className="chart-body" style={{ height: 250 }}>
          {loading ? (
            <div className="chart-loading-placeholder">
              <span className="loading-pulse">Loading analyst metrics...</span>
            </div>
          ) : userBreakdown.length === 0 ? (
            <div className="chart-empty">No analyst records</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userBreakdown} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a324b" vertical={false} />
                <XAxis dataKey="_id" stroke="#717a94" fontSize={12} tickLine={false} />
                <YAxis stroke="#717a94" fontSize={12} tickLine={false} tickFormatter={formatCurrency} />
                <Tooltip
                  formatter={(val: number) => `$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                  contentStyle={{ backgroundColor: '#182033', borderColor: '#2e3b59', borderRadius: 8, color: '#fff' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: 10 }} />
                <Bar dataKey="revenue" name="Revenue" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#F43F5E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};
