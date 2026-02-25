import axios from 'axios';
const BASE_URL = import.meta.env.VITE_BASE_URL + 'genre';

class GenreService {
  getGenres() { //All
    return axios.get(BASE_URL);
  }
  getGenreById(GenreId) { //Id
    return axios.get(BASE_URL + '/' + GenreId);
  }
  getMoviesbyGenre(GenreId) { //Personalizado para obtener las películas de un género específico
    return axios.get(BASE_URL + '/getMoviesbyGenre/' + GenreId);
  }
}

export default new GenreService();
