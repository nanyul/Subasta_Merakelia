<?php
class Rol
{
    public function index() //All
    {
        try {
            $response = new Response();
            //Obtener el listado del Modelo
            $rol = new RolModel();
            $result = $rol->all();
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
            $rol = new RolModel();
            $result = $rol->get($param);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }
}
