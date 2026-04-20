import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL + "Subasta";
const PUJA_URL = import.meta.env.VITE_BASE_URL + "Puja";

class SubastaService {

    getAllSubastas() {
        return axios.get(BASE_URL);
    }

    getSubastasActivas() {
        return axios.get(BASE_URL + "/activas");
    }

    getSubastasActivasYProgramadas() {
        return axios.get(BASE_URL + "/activasYProgramadas");
    }

    getSubastasFinalizadas() {
        return axios.get(BASE_URL + "/finalizadas");
    }

    getProgramadas() {
        return axios.get(BASE_URL + "/programadas");
    }

    getSubastasPendientesPago() {
        return axios.get(BASE_URL + "/pendientesPago");
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

    cambiarAPendientePago(id_subasta) {
        return axios.post(BASE_URL + "/cambiarAPendientePago", JSON.stringify({ id_subasta }));
    }

    getDetalleSubasta(id) {
        return axios.get(`${PUJA_URL}/detalle/${id}`);
    }

    registrarPuja(monto, id_usuario, id_subasta) {
        return axios.post(`${PUJA_URL}/registrar`, { monto, id_usuario, id_subasta });
    }

    finalizarSubasta(id_subasta) {
        return axios.post(`${PUJA_URL}/finalizar`, { id_subasta });
    }

    cambiarAPendientePago(id_subasta) {
        return axios.post(BASE_URL + "/cambiarAPendientePago", { id_subasta });
    }

    confirmarPago(id_subasta) {
        return axios.post(BASE_URL + "/confirmarPago", { id_subasta });
    }

}

export default new SubastaService();