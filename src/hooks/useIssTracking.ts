import { useState, useEffect } from 'react';
import { fetchIssLocation, fetchAstronauts, calculateDistance, IssResponse, AstrosResponse } from '../services/issService';

export interface TrackingData {
    lat: number;
    lon: number;
    timestamp: number;
    speed: number;
}

export const useIssTracking = () => {
    const [positions, setPositions] = useState<TrackingData[]>([]);
    const [astros, setAstros] = useState<AstrosResponse | null>(null);
    const [loading, setLoading] = useState(true);

    const updateIssData = async () => {
        try {
            const locData = await fetchIssLocation();
            const lat = parseFloat(locData.iss_position.latitude);
            const lon = parseFloat(locData.iss_position.longitude);
            const time = locData.timestamp * 1000;

            setPositions(prev => {
                let speed = 0;
                if (prev.length > 0) {
                    const lastPos = prev[prev.length - 1];
                    const distance = calculateDistance(lastPos.lat, lastPos.lon, lat, lon);
                    const timeDiffHour = (time - lastPos.timestamp) / 3600000; // in hours
                    speed = timeDiffHour > 0 ? distance / timeDiffHour : 0;
                    
                    // Filter extreme speed artifacts resulting from small time intervals
                    if (speed > 40000 || speed < 10000 && prev.length > 1) {
                         speed = prev[prev.length - 1].speed;
                    }
                } else {
                    // Approximate ISS average speed initially
                    speed = 27600;
                }

                const newPos = { lat, lon, timestamp: time, speed };
                const newArr = [...prev, newPos];
                
                // Keep only last 30 readings for charts, but instructions say "Store last 15 coordinates" for map, 
                // "Store last 30 readings" for speed chart. So max 30 for both.
                if (newArr.length > 30) newArr.shift();
                return newArr;
            });
            setLoading(false);
        } catch(e) {
            console.error("Failed to fetch ISS data", e);
        }
    };

    const loadAstros = async () => {
        try {
            const astroData = await fetchAstronauts();
            setAstros(astroData);
        } catch(e) {
            console.error("Failed to fetch Astros data", e);
        }
    };

    useEffect(() => {
        updateIssData();
        loadAstros();
        const interval = setInterval(updateIssData, 15000);
        return () => clearInterval(interval);
    }, []);

    return { 
        positions, 
        currentPos: positions[positions.length - 1] || null, 
        astros, 
        loading,
        manualRefresh: updateIssData 
    };
};
