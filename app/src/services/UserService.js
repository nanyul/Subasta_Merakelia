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

  createUser(user) {
    return axios.post(BASE_URL, JSON.stringify(user), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  updateUser(user) {
    return axios.put(BASE_URL, JSON.stringify(user), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  updateUserStatus(id) {
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

  loginUser(User) {
    return axios.post(BASE_URL + '/login/', JSON.stringify(User), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

export default new UserService();
