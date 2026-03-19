import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL + "Subasta";

class SubastaService {

    getAllSubastas() {
        return axios.get(BASE_URL);
    }

    getSubastasActivas() {
        return axios.get(BASE_URL + "/activas");
    }

    getSubastasFinalizadas() {
        return axios.get(BASE_URL + "/finalizadas");
    }

    getProgramadas() {
        return axios.get(BASE_URL + "/programadas");
    }

    getSubastaById(id) {
        return axios.get(BASE_URL + "/" + id);
    }

    getHistorialPujas(id) {
        return axios.get(BASE_URL + "/" + "pujas/" + id);
    }

    createSubasta(subasta) {
        return axios.post(BASE_URL, JSON.stringify(subasta));
    }

    updateSubasta(subasta) {
       return axios({
      method: 'put',
      url: BASE_URL,
      data: JSON.stringify(subasta)
    })
    }

    publishSubasta(id) {
        return axios.post(BASE_URL + "/publish", JSON.stringify({ id }));
    }

    cancelSubasta(id) {
        return axios.post(BASE_URL + "/cancel", JSON.stringify({ id }));
    }
}

export default new SubastaService();