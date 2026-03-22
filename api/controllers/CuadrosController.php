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
            $cuadros = new CuadrosModel();
            //Acción del modelo a ejecutar
            $result = $cuadros->create($inputJSON);
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
            $cuadros = new CuadrosModel();
            //Acción del modelo a ejecutar
            $result = $cuadros->update($inputJSON);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            $response = new Response();
            $response->toJSON([
                'success' => false,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }
    

}
