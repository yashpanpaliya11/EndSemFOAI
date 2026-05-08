import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { Article } from '../services/newsService';

interface Props {
    articles: Article[];
}

export const NewsChart: React.FC<Props> = ({ articles }) => {
    // Generate some interesting data from articles for the chart
    // We'll group them by source name (simplified)
    const sourceMap = new Map<string, number>();
    articles.forEach(a => {
        const sourceName = a.source?.name || 'Unknown';
        sourceMap.set(sourceName, (sourceMap.get(sourceName) || 0) + 1);
    });

    let data = Array.from(sourceMap.entries()).map(([name, value]) => ({ name, value }));
    
    // Sort and take top 5, group rest into Others
    data.sort((a,b) => b.value - a.value);
    if(data.length > 5) {
        const othersValue = data.slice(5).reduce((acc, curr) => acc + curr.value, 0);
        data = data.slice(0, 5);
        data.push({ name: 'Others', value: othersValue });
    }

    const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'];

    return (
        <div className="h-64 w-full">
            {data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="rgba(0,0,0,0.2)"
                            strokeWidth={2}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <RechartsTooltip 
                            contentStyle={{ backgroundColor: 'rgba(12, 16, 33, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                            itemStyle={{ color: '#e2e8f0', fontFamily: 'JetBrains Mono' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}/>
                    </PieChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-slate-500 text-sm">No data available</div>
            )}
        </div>
    );
};
