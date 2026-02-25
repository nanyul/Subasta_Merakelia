import axios from 'axios';
const BASE_URL = import.meta.env.VITE_BASE_URL + 'User';

class UserService {
  getUsers() {
    return axios.get(BASE_URL);
  }
  getUserById(UserId) {
    return axios.get(BASE_URL + '/' + UserId);
  }
}

export default new UserService();
