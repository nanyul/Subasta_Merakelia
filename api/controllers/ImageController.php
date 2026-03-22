<?php
//class Image
class Image{
    //POST Crear
    public function create()
    {
        try {
            $response = new Response();
            //Instancia del modelo
            $imagen = new ImageModel();
            //Acción del modelo a ejecutar (pasamos null porque el modelo lee de $_FILES directamente)
            $result = $imagen->uploadFile(null);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
            
        }
    }
    public function get($id)
    {
        try {
            $response = new Response();
            $imagen = new ImageModel();
            $result = $imagen->getImageCuadro($id);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
            
        }
    }
}