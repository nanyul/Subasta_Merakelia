<?php
class User
{
    public function index() //All
    {
        try {
            $response = new Response();
            //Obtener el listado del Modelo
            $user = new UserModel();
            $result = $user->all();
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
            $user = new UserModel();
            $result = $user->get($param);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }
}
