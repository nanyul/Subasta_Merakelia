import axios from 'axios';
const BASE_URL = import.meta.env.VITE_BASE_URL + 'Categorias'; 

class CategoriasService {
  getCategorias() {
    return axios.get(BASE_URL);
  }

  getCategoriaById(categoriaId) {
    return axios.get(BASE_URL + '/' + categoriaId);
  }
}

export default new CategoriasService();
