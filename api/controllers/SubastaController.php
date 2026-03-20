<?php
class Subasta
{
    public function index()
    {
        $this->all();
    }


    // Devuelve todas las subastas (activas + finalizadas)
    public function all()
    {
        try {
            $response = new Response();
            $subasta  = new SubastaModel();
            $result   = $subasta->all();
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON(null);
            handleException($e);
        }
    }

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


    // Devuelve el listado de subastas programadas (estado: borrador)
    public function programadas()
    {
        try {
            $response = new Response();
            $subasta  = new SubastaModel();
            $result   = $subasta->getProgramadas();
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON(null);
            handleException($e);
        }
    }


    // GET /subastas/detalle/{id}
    // Devuelve el detalle completo de una subasta
    public function get($param)
    {
        try {
            $response = new Response();
            $subasta  = new SubastaModel();
            $result   = $subasta->get($param);
            // Validación: si la subasta no existe, retornar error
            if ($result === null) {
                $response->toJSON([
                    'error'   => true,
                    'mensaje' => 'Subasta no encontrada.'
                ]);
                return;
            }
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON(null);
            handleException($e);
        }
    }


    // GET /subastas/pujas/{id_subasta}
    // Devuelve el historial de pujas de una subasta
    public function pujas($param)
    {
        try {
            $response = new Response();
            $subasta  = new SubastaModel();
            $result   = $subasta->getHistorialPujas($param);
            // Validación: si la subasta no existe, retornar error
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

    //POST Crear
    public function create()
    {
        try {
            $request = new Request();
            $response = new Response();
            //Obtener json enviado
            $inputJSON = $request->getJSON();
            //Instancia del modelo
            $subasta = new SubastaModel();
            //Acción del modelo a ejecutar
            $result = $subasta->create($inputJSON);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }
    
    //PUT actualizar
    public function update()
    {
        try {
            $request = new Request();
            $response = new Response();
            //Obtener json enviado
            $inputJSON = $request->getJSON();
            //Instancia del modelo
            $subasta = new SubastaModel();
            //Acción del modelo a ejecutar
            $result = $subasta->update($inputJSON);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }


    private function isModelError($result): bool
    {
        return is_array($result) && isset($result['error']);
    }

    public function publish()
    {
        try {
            $request   = new Request();
            $response  = new Response();
            $inputJSON = $request->getJSON();

            if (!isset($inputJSON->id)) {
                $response->toJSON(['success' => false, 'message' => 'ID de subasta es requerido']);
                return;
            }

            $result = (new SubastaModel())->publish($inputJSON->id);

            $this->isModelError($result)
                ? $response->toJSON(['success' => false, 'message' => $result['error']])
                : $response->toJSON(['success' => true,  'message' => 'Subasta publicada correctamente.', 'data' => $result]);
        } catch (Exception $e) {
            $response->toJSON(null);
            handleException($e);
        }
    }

    public function cancel()
    {
        try {
            $request   = new Request();
            $response  = new Response();
            $inputJSON = $request->getJSON();

            if (!isset($inputJSON->id)) {
                $response->toJSON(['success' => false, 'message' => 'ID de subasta es requerido']);
                return;
            }

            $result = (new SubastaModel())->cancel($inputJSON->id);

            $this->isModelError($result)
                ? $response->toJSON(['success' => false, 'message' => $result['error']])
                : $response->toJSON(['success' => true,  'message' => 'Subasta cancelada correctamente.', 'data' => $result]);
        } catch (Exception $e) {
            $response->toJSON(null);
            handleException($e);
        }
    }
}
