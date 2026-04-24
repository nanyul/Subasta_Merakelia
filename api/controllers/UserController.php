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

    public function create()
    {
        try {
            $request = new Request();
            $response = new Response();
            //Obtener json enviado
            $inputJSON = $request->getJSON();
            if (!$inputJSON) $inputJSON = new stdClass();
            // Agregar campos automáticos si no existen
            if (!isset($inputJSON->fecha_registro)) $inputJSON->fecha_registro = date('Y-m-d H:i:s');
            if (!isset($inputJSON->estado)) $inputJSON->estado = 1;
            //Instancia del modelo
            $user = new UserModel();
            //Acción del modelo a ejecutar
            $result = $user->create($inputJSON);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }



    public function update()
    {
        try {
            $request = new Request();
            $response = new Response();
            //Obtener json enviado
            $inputJSON = $request->getJSON();
            if (!$inputJSON) $inputJSON = new stdClass();
            //Instancia del modelo
            $user = new UserModel();
            //Acción del modelo a ejecutar
            $result = $user->update($inputJSON);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }


    public function status($param) 
    {
        try {
            $response = new Response();
            $user = new UserModel();
            $result = $user->delete($param);
            
            // Si el resultado es null, significa que el usuario tiene subastas asociadas
            if ($result === null) {
                $response->toJSON(null, "No se puede desactivar un usuario que tiene subastas asociadas");
            } else {
                $response->toJSON($result);
            }
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }

    public function login()
    {
        $response = new Response();
        $request = new Request();
        
        // Obtener JSON enviado
        $inputJSON = $request->getJSON();
        
        // Si no recibe JSON, intenta obtener de $_POST
        if ($inputJSON === null && !empty($_POST)) {
            $inputJSON = (object)$_POST;
        }
        
        $usuario = new UserModel();
        $result = $usuario->login($inputJSON);
        
        if (isset($result) && !empty($result) && $result != false) {
            $response->toJSON($result);
        } else {
            $response->toJSON(null, "Usuario no válido");
        }
    }
    
}
