// capturarCoordenadas: realiza leitura da Geolocation API e preenche inputs de latitude/longitude
function setGpsStatus(message) {
  const statusElement = document.getElementById('gps-status');
  if (statusElement) statusElement.textContent = message;
}

function capturarCoordenadas() {
  if (!navigator.geolocation || typeof navigator.geolocation.getCurrentPosition !== 'function') {
    console.warn('Geolocation não suportado pelo navegador.');
    setGpsStatus('Não foi possível capturar as coordenadas: recurso indisponível.');
    return;
  }

  const onSuccess = (pos) => {
    const lat = pos.coords.latitude?.toString() ?? '';
    const lon = pos.coords.longitude?.toString() ?? '';

    const latInput = document.getElementById('latitude');
    const lonInput = document.getElementById('longitude');

    if (latInput) latInput.value = lat;
    if (lonInput) lonInput.value = lon;

    setGpsStatus(`GPS capturado: ${lat}, ${lon}`);
  };

  const onError = (err) => {
    console.warn('Erro obtendo posição:', err);
    setGpsStatus('Falha ao capturar coordenadas. Verifique as permissões de localização.');
  };

  const options = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
  };

  navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
}

// Executa ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
  try {
    capturarCoordenadas();
  } catch (e) {
    console.error('Falha ao inicializar captura de coordenadas', e);
    setGpsStatus('Erro ao inicializar captura de GPS.');
  }
});

if (typeof window !== 'undefined') {
  window.capturarCoordenadas = capturarCoordenadas;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { capturarCoordenadas };
}
