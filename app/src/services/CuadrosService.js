import axios from 'axios';
const BASE_URL = import.meta.env.VITE_BASE_URL + 'CuadrosSubastables'; 
//http://localhost:81/merakelia/api/ + CuadrosSubastables
class CuadrosService {
  getCuadros() {
    return axios.get(BASE_URL); //index
  }

  getCuadroById(CuadroId) {
    return axios.get(BASE_URL + '/' + CuadroId); //Get by ID
  }

  createCuadro(cuadro) {
    return axios.post(BASE_URL, JSON.stringify(cuadro), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  updateCuadro(cuadro) {
    return axios.put(BASE_URL, JSON.stringify(cuadro), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  updateCuadroStatus(id) {
    return axios.put(BASE_URL + '/status/' + id, JSON.stringify({}), {
      headers: {
        'Content-Type': 'application/json'
      }
    }).catch(error => {
      // Si hay un error de respuesta (4xx, 5xx), devolver la respuesta de error
      if (error.response) {
        return error.response;
      }
      throw error;
    });
  }
}

export default new CuadrosService();
