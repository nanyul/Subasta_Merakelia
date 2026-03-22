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
}

export default new CuadrosService();
