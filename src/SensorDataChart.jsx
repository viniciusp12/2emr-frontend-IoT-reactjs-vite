import React, { useEffect, useState } from 'react';
import Chart from 'chart.js/auto';

const SensorDataChart = () => {
  const [sensorData, setSensorData] = useState([]); // Estado para armazenar os dados do sensor
  const [tempChartInstance, setTempChartInstance] = useState(null); // Instância do gráfico de temperatura
  const [humidityChartInstance, setHumidityChartInstance] = useState(null); // Instância do gráfico de umidade
  const [isLoading, setIsLoading] = useState(true); // Estado para controlar o carregamento inicial

  // Função para enviar os dados do sensor para o backend
  const sendSensorData = async () => {
    const dadosSensor = {
      sensor_id: 1,
      temperatura: Math.random() * 50, // Gerando temperatura aleatória
      umidade: Math.random() * 100 // Gerando umidade aleatória
    };

    try {
      const response = await fetch('http://localhost:3000/inserir-dados-sensor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosSensor)
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar dados do sensor: ' + response.statusText);
      }

      console.log('Dados do sensor enviados com sucesso.');
    } catch (error) {
      console.error('Erro ao enviar dados do sensor:', error);
    }
  };

  // Busca inicial de dados do backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3000/dados-sensores');
        if (!response.ok) {
          throw new Error('Erro ao buscar dados: ' + response.statusText);
        }
        const data = await response.json();
        setSensorData(data);
        setIsLoading(false); // Marcamos que a busca de dados terminou
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    };

    fetchData();
  }, []);

  // Atualização periódica dos dados a cada 10 segundos
  useEffect(() => {
    const updateChartData = async () => {
      try {
        await sendSensorData(); // Enviar os dados do sensor a cada 10 segundos

        const response = await fetch('http://localhost:3000/dados-sensores');
        if (!response.ok) {
          throw new Error('Erro ao buscar dados: ' + response.statusText);
        }
        const data = await response.json();
        setSensorData(data);
      } catch (error) {
        console.error('Erro ao buscar ou atualizar dados:', error);
      }
    };

    const interval = setInterval(updateChartData, 10000); // Intervalo de 10 segundos

    return () => clearInterval(interval); // Limpar intervalo ao desmontar o componente
  }, []);

  // Renderização dos gráficos
  useEffect(() => {
    if (!isLoading) { // Renderizar gráficos somente após o carregamento inicial
      if (tempChartInstance) {
        tempChartInstance.destroy(); // Destruir o gráfico existente antes de criar um novo
      }
      if (humidityChartInstance) {
        humidityChartInstance.destroy(); // Destruir o gráfico existente antes de criar um novo
      }

      const tempCtx = document.getElementById('temp-chart');
      const humidityCtx = document.getElementById('humidity-chart');

      // Criar novo gráfico de temperatura
      const newTempChartInstance = new Chart(tempCtx, {
        type: 'line',
        data: {
          labels: sensorData.map(entry => {
            const timestamp = new Date(entry.timestamp);
            timestamp.setHours(timestamp.getHours() - 3); // Ajuste de fuso horário
            return timestamp.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
          }),
          datasets: [
            {
              label: 'Temperatura',
              data: sensorData.map(entry => entry.temperatura),
              borderColor: 'rgb(227 15 89)',
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

      // Criar novo gráfico de umidade
      const newHumidityChartInstance = new Chart(humidityCtx, {
        type: 'line',
        data: {
          labels: sensorData.map(entry => {
            const timestamp = new Date(entry.timestamp);
            timestamp.setHours(timestamp.getHours() - 3); // Ajuste de fuso horário
            return timestamp.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
          }),
          datasets: [
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

      setTempChartInstance(newTempChartInstance); // Armazenar nova instância do gráfico de temperatura
      setHumidityChartInstance(newHumidityChartInstance); // Armazenar nova instância do gráfico de umidade
    }
  }, [sensorData, isLoading]);

  return (
    <div>
      <canvas id="temp-chart" width="600" height="200"></canvas>
      <canvas id="humidity-chart" width="600" height="200"></canvas>
    </div>
  );
};

export default SensorDataChart;