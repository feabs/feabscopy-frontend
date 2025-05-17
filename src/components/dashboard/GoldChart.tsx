
"use client";

import React, { useEffect, useRef, useState } from 'react';

const GoldChart = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [widgetContainerId, setWidgetContainerId] = useState<string | null>(null);

  useEffect(() => {
    // Generate a unique ID for the widget container only on the client
    setWidgetContainerId(`tradingview-chart-${Math.random().toString(36).substr(2, 9)}`);
  }, []);

  useEffect(() => {
    if (!widgetContainerId || !chartRef.current) {
      return;
    }

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "width": "100%",
      "height": 500,
      "symbol": "FX_IDC:XAUUSD",
      "interval": "D",
      "timezone": "Etc/UTC",
      "theme": "light", // For dark theme, you might want to make this dynamic or offer a toggle
      "style": "1",
      "locale": "en",
      "toolbar_bg": "#f1f3f6",
      "enable_publishing": false,
      "allow_symbol_change": false,
      "hideideas": true,
      "container_id": widgetContainerId
    });

    // Clear previous widget if script is re-run (e.g., due to HMR)
    while (chartRef.current.firstChild) {
      chartRef.current.removeChild(chartRef.current.firstChild);
    }
    chartRef.current.appendChild(script);

    // Cleanup script when component unmounts or widgetContainerId changes
    return () => {
      if (chartRef.current) {
        while (chartRef.current.firstChild) {
          chartRef.current.removeChild(chartRef.current.firstChild);
        }
      }
    };
  }, [widgetContainerId]); // Depend on widgetContainerId

  return (
    <div className="tradingview-widget-container" ref={chartRef} style={{ height: '500px', width: '100%' }}>
      <div id={widgetContainerId || undefined} className="tradingview-widget-container__widget" style={{ height: '100%', width: '100%' }}></div>
       {/* Fallback content or loading indicator if needed */}
       {!chartRef.current?.hasChildNodes() && !widgetContainerId && (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Loading XAUUSD Chart...</p>
          </div>
        )}
    </div>
  );
};

export default GoldChart;
