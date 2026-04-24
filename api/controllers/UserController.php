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
        
        // Log de debug
        error_log("=== LOGIN DEBUG ===");
        error_log("REQUEST METHOD: " . $_SERVER['REQUEST_METHOD']);
        error_log("REQUEST URI: " . $_SERVER['REQUEST_URI']);
        error_log("CONTENT TYPE: " . ($_SERVER["CONTENT_TYPE"] ?? "VACIO"));
        
        // Obtener JSON enviado
        $rawInput = file_get_contents("php://input");
        error_log("RAW INPUT: " . $rawInput);
        
        $inputJSON = $request->getJSON();
        error_log("JSON DECODED: " . json_encode($inputJSON));
        
        // Debug: Si no recibe JSON, intenta obtener de $_POST
        if ($inputJSON === null && !empty($_POST)) {
            $inputJSON = (object)$_POST;
            error_log("USANDO POST: " . json_encode($inputJSON));
        }
        
        $usuario = new UserModel();
        $result = $usuario->login($inputJSON);
        error_log("LOGIN RESULT: " . ($result ? "SUCCESS - " . substr($result, 0, 50) : "FAIL"));
        error_log("=== END DEBUG ===");
        
        if (isset($result) && !empty($result) && $result != false) {
            $response->toJSON($result);
        } else {
            $response->toJSON(null, "Usuario no válido");
        }
    }
    
}
