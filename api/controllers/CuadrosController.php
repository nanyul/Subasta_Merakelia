<?php
class CuadrosSubastables
{
    public function index() //All
    {
        try {
            $response = new Response();
            //Obtener el listado del Modelo
            $cuadros = new CuadrosModel();
            $result = $cuadros->all();
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
            $cuadros = new CuadrosModel();
            $result = $cuadros->get($param);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }
}
