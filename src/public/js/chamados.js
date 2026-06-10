// capturarCoordenadas: realiza leitura da Geolocation API e preenche inputs de latitude/longitude
function capturarCoordenadas() {
  if (!('geolocation' in navigator)) {
    console.warn('Geolocation não suportado pelo navegador.');
    return;
  }

  const onSuccess = (pos) => {
    const lat = pos.coords.latitude?.toString() ?? '';
    const lon = pos.coords.longitude?.toString() ?? '';

    const latInput = document.getElementById('latitude');
    const lonInput = document.getElementById('longitude');

    if (latInput) latInput.value = lat;
    if (lonInput) lonInput.value = lon;
  };

  const onError = (err) => {
    console.warn('Erro obtendo posição:', err);
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
  }
});

export { capturarCoordenadas };
