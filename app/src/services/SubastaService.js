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

    getSubastaById(id) {
        return axios.get(BASE_URL + "/" + id);
    }

    getHistorialPujas(id) {
        return axios.get(BASE_URL + "/" + id + "/pujas");
    }

}

export default new SubastaService();