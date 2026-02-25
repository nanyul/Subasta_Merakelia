<?php
class CategoriasController
{
    public function index() //All
    {
        try {
            $response = new Response();
            //Obtener el listado del Modelo
            $categorias = new CategoriasModel();
            $result = $categorias->all();
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }
    public function get($param) //GetById
    {
        try {
            $response = new Response();
            $categorias = new CategoriasModel();
            $result = $categorias->get($param);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }
}
