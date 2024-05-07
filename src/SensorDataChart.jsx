import React, { useEffect, useState } from 'react';
import Chart from 'chart.js/auto';

const SensorDataChart = () => {
const [sensorData, setSensorData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3000/dados-sensores');
        if (!response.ok) {
          throw new Error('Erro ao buscar dados: ' + response.statusText);
        }
        const data = await response.json();
        setSensorData(data);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    };
  
    fetchData();
  }, []);
  

  useEffect(() => {
    if (sensorData.length > 0) {
      const ctx = document.getElementById('sensor-chart');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: sensorData.map(entry => entry.timestamp),
          datasets: [
            {
            label: 'Temperatura',
            data: sensorData.map(entry => entry.temperatura),
            borderColor: 'rgb(227 15 89)',
          }, 
          {
            label: 'Umidade',
            data: sensorData.map(entry => entry.umidade),
            borderColor: 'rgb(54, 162, 235)',
          }
         ]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  }, [sensorData]);

  return <canvas id="sensor-chart" width="600" height="200"></canvas>;
};

export default SensorDataChart;