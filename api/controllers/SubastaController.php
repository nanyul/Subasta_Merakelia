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
            
            // ⚠️ Activar subastas que ya llegó su hora de inicio
            $subasta->activarTodasLasListas();
            
            // ⚠️ Limpiar subastas vencidas
            $subasta->cerrarTodasLasVencidas();
            
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
            
            // ⚠️ Activar subastas que ya llegó su hora de inicio
            $subasta->activarTodasLasListas();
            
            // ⚠️ Limpiar subastas vencidas ANTES de retornar (de forma segura)
            $subasta->cerrarTodasLasVencidas();
            
            $result   = $subasta->getActivas();
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON(null);
            handleException($e);
        }
    }

    // Devuelve subastas programadas y activas (para tabla principal)
    public function activasYProgramadas()
    {
        try {
            $response = new Response();
            $subasta  = new SubastaModel();
            
            // ⚠️ Activar subastas que ya llegó su hora de inicio
            $subasta->activarTodasLasListas();
            
            // ⚠️ Limpiar subastas vencidas ANTES de retornar
            $subasta->cerrarTodasLasVencidas();
            
            $programadas = $subasta->getProgramadas();
            $activas     = $subasta->getActivas();
            
            // Combinar: programadas primero, luego activas
            $result = array_merge($programadas, $activas);
            
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


    // GET /Subasta/pendientesPago
    // Devuelve subastas con estado 5 (pago pendiente)
    public function pendientesPago()
    {
        try {
            $response = new Response();
            $subasta  = new SubastaModel();
            $result   = $subasta->getPendientesPago();

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

            if (is_array($result) && count($result) === 0) {
                http_response_code(200);
                echo json_encode([
                    "success" => true,
                    "status"  => 200,
                    "message" => "Solicitud exitosa",
                    "data"    => []
                ], JSON_UNESCAPED_UNICODE);
                return;
            }

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
            $inputJSON = $request->getJSON();
            $subasta = new SubastaModel();
            $result = $subasta->update($inputJSON);
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

    // POST: Cambiar subasta a estado PENDIENTE PAGO (5)
    // Se basa en que la subasta fue finalizada y tiene ganador
    public function cambiarAPendientePago()
    {
        try {
            $request   = new Request();
            $response  = new Response();
            $inputJSON = $request->getJSON();

            if (!isset($inputJSON->id_subasta)) {
                $response->toJSON(['success' => false, 'message' => 'ID de subasta es requerido']);
                return;
            }

            $subasta = new SubastaModel();
            $subasta->cambiarAPendientePago($inputJSON->id_subasta);

            $response->toJSON(['success' => true, 'message' => 'Subasta movida a estado pendiente pago.']);
        } catch (Exception $e) {
            $response->toJSON(null);
            handleException($e);
        }
    }
}
