import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrackingData } from '../hooks/useIssTracking';

interface Props {
    data: TrackingData[];
}

export const SpeedChart: React.FC<Props> = ({ data }) => {
    const chartData = data.map(d => ({
        time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        speed: Math.round(d.speed)
    }));

    return (
        <div className="h-48 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorSpeed" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <XAxis 
                        dataKey="time" 
                        stroke="#64748b" 
                        fontSize={10} 
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis 
                        domain={['dataMin - 1000', 'dataMax + 1000']} 
                        stroke="#64748b" 
                        fontSize={10}
                        tickFormatter={(value) => `${value}`}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(12, 16, 33, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                        itemStyle={{ color: '#818cf8', fontFamily: 'JetBrains Mono' }}
                        labelStyle={{ color: '#cbd5e1', marginBottom: '4px' }}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="speed" 
                        stroke="#818cf8" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorSpeed)" 
                        isAnimationActive={false}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
