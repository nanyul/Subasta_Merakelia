<?php

class Subasta
{

    public function index()
    {
        $this->activas();
    }
    
    // GET /subastas/activas
    // Devuelve el listado de subastas activas
    public function activas()
    {
        try {
            $response = new Response();
            $subasta  = new SubastaModel();
            $result   = $subasta->getActivas();
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON(null);
            handleException($e);
        }
    }

    
    // GET /subastas/finalizadas
    // Devuelve el listado de subastas finalizadas y canceladas
    public function finalizadas()
    {
        try {
            $response = new Response();
            $subasta  = new SubastaModel();
            $result   = $subasta->getFinalizadas();
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON(null);
            handleException($e);
        }
    }

    
    // GET /subastas/detalle/{id}
    // Devuelve el detalle completo de una subasta
    public function detalle($param)
    {
        try {
            $response = new Response();
            $subasta  = new SubastaModel();
            $result   = $subasta->getDetalle($param);
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON(null);
            handleException($e);
        }
    }

   
    // GET /subastas/pujas/{id_subasta}
    // Devuelve el historial de pujas de una subasta
    // Validación: solo devuelve pujas del id_subasta dado
    public function pujas($param)
    {
        try {
            $response = new Response();
            $subasta  = new SubastaModel();
            $result   = $subasta->getHistorialPujas($param);

            if ($result === null) {
                $response->toJSON([
                    'error'   => true,
                    'mensaje' => 'Subasta no encontrada o sin pujas asociadas.'
                ]);
                return;
            }

            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON(null);
            handleException($e);
        }
    }
}
