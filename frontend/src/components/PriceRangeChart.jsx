import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from "chart.js";
import { fetchPriceRanges } from "../utils/api.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip
);

export default function PriceRangeChart() {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadPriceRanges() {
      try {
        const data = await fetchPriceRanges();

        if (data && Array.isArray(data) && data.length > 0) {
          const priceRangeOrder = [
            'Under $10k',
            '$10k - $20k',
            '$20k - $30k',
            '$30k - $50k',
            '$50k - $75k'
          ];

          const sortedData = priceRangeOrder.map(range => {
            const found = data.find(item => item.price_range === range);
            return found ? found.count : 0;
          });

          setChartData({
            labels: priceRangeOrder,
            datasets: [
              {
                label: "Number of Cars",
                data: sortedData,
                backgroundColor: "rgba(234, 179, 8, 0.8)",
                borderColor: "rgba(234, 179, 8, 1)",
                borderWidth: 1,
              },
            ],
          });
        } else {
          setError("No price data available");
        }
      } catch (err) {
        setError(err.message || "Failed to load chart data");
      } finally {
        setLoading(false);
      }
    }

    loadPriceRanges();
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Cars: ${context.parsed.y}`;
          }
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          precision: 0,
        },
        title: {
          display: true,
          text: "Number of Cars",
        },
      },
      x: {
        title: {
          display: true,
          text: "Price Range",
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <p className="text-zinc-600">Loading chart data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-96 flex items-center justify-center">
        <p className="text-red-600">Error loading chart</p>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="h-96 flex items-center justify-center">
        <p className="text-zinc-600">No data available</p>
      </div>
    );
  }

  return (
    <div className="h-96 w-full">
      <Bar data={chartData} options={options} />
    </div>
  );
}
