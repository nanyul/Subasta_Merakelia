import axios from 'axios';
const BASE_URL = import.meta.env.VITE_BASE_URL + 'User'; //URL controller
//http://localhost:81/appmovie/api/ + User
class UserService {
  getUsers() {
    return axios.get(BASE_URL); //index
  }

  getUserById(UserId) {
    return axios.get(BASE_URL + '/' + UserId); //Get by ID
  }
}

export default new UserService();
