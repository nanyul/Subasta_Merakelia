<?php

class Puja
{
    public function historial($param)
    {
        try {
            $response = new Response();
            $subasta  = new SubastaModel();
            $result   = $subasta->getHistorialPujas($param);
            if ($result === null) {
                $response->toJSON(['error' => true, 'mensaje' => 'Subasta no encontrada.']);
                return;
            }
            $response->toJSON($result);
        } catch (Exception $e) {
            (new Response())->toJSON(null);
            handleException($e);
        }
    }

    public function maxima($param)
    {
        try {
            $response = new Response();
            $subasta  = new SubastaModel();
            $result   = $subasta->getPujaMaxima($param);
            $response->toJSON($result);
        } catch (Exception $e) {
            (new Response())->toJSON(null);
            handleException($e);
        }
    }

    public function registrar()
    {
        try {
            $request  = new Request();
            $response = new Response();
            $input    = $request->getJSON();

            if (!isset($input->monto) || !isset($input->id_usuario) || !isset($input->id_subasta)) {
                $response->toJSON(['error' => true, 'mensaje' => 'Faltan campos: monto, id_usuario, id_subasta.']);
                return;
            }

            $pujaM  = new PujaModel();
            $result = $pujaM->procesarPuja(
                floatval($input->monto),
                intval($input->id_usuario),
                intval($input->id_subasta)
            );

            if (isset($result['error'])) {
                http_response_code(422);
                $response->toJSON(['error' => true, 'mensaje' => $result['error']]);
                return;
            }

            // Emitir evento Ably ANTES de responder
            $this->emitirNuevaPuja($input->id_subasta, $result);

            http_response_code(201);
            $response->toJSON(['success' => true, 'mensaje' => 'Puja registrada correctamente.', 'data' => $result]);

        } catch (Exception $e) {
            (new Response())->toJSON(null);
            handleException($e);
        }
    }

    public function detalle($param)
    {
        try {
            $response = new Response();
            $subastaM = new SubastaModel();
            $result   = $subastaM->getDetalleActiva($param);

            if ($result === null) {
                $response->toJSON(['error' => true, 'mensaje' => 'Subasta no encontrada.']);
                return;
            }

            // ⚠️ IMPORTANTE: NO modificamos el estado aquí
            // Si $result->deberiaCerrarse es true, el cliente lo detectará por la fecha
            // El cierre automático debe ocurrir por cron o endpoint POST explícito
            
            $response->toJSON($result);
        } catch (Exception $e) {
            (new Response())->toJSON(null);
            handleException($e);
        }
    }

    // ─────────────────────────────────────────────
    // FINALIZAR SUBASTA (POST)
    // El frontend llama cuando detecta que vencida
    // POST /Puja/finalizar
    // ─────────────────────────────────────────────
    public function finalizar()
    {
        try {
            $request  = new Request();
            $response = new Response();
            $input    = $request->getJSON();

            if (!isset($input->id_subasta)) {
                http_response_code(400);
                $response->toJSON(['error' => true, 'mensaje' => 'Falta id_subasta.']);
                return;
            }

            $id_subasta = intval($input->id_subasta);
            $subastaM = new SubastaModel();

            // Verificar que debería estar cerrada
            if (!$subastaM->deberiaCerrarse($id_subasta)) {
                http_response_code(422);
                $response->toJSON(['error' => true, 'mensaje' => 'La subasta aun no vence o ya está cerrada.']);
                return;
            }

            // Cerrar explícitamente
            $subastaM->cerrarSiVencio($id_subasta);

            // Obtener ganador y emitir evento Ably
            $ganador = $subastaM->getPujaMaxima($id_subasta);
            $this->emitirCierre($id_subasta, $ganador);

            // Si hay ganador (al menos una puja), cambiar a estado PENDIENTE PAGO (5)
            if ($ganador) {
                $subastaM->cambiarAPendientePago($id_subasta);
            }

            // ✅ Retornar ganador en la respuesta para mostrar inmediatamente
            $response->toJSON([
                'success' => true, 
                'mensaje' => 'Subasta finalizada correctamente.',
                'ganador' => $ganador
            ]);

        } catch (Exception $e) {
            (new Response())->toJSON(null);
            handleException($e);
        }
    }

    // Convierte stdClass y arrays de objetos PHP a arrays puros
    // para que Ably los serialice correctamente a JSON
    private function toArray($data)
    {
        return json_decode(json_encode($data), true);
    }

    private function emitirNuevaPuja($id_subasta, $data)
    {
        try {
            $ably    = new \Ably\AblyRest(Config::get('ABLY_KEY'));
            $channel = $ably->channels->get("subasta-$id_subasta");

            $channel->publish('nueva-puja', [
                'id_subasta'  => intval($id_subasta),
                'puja_maxima' => $this->toArray($data['puja_maxima']),
                'historial'   => $this->toArray($data['historial']),
                'id_puja'     => intval($data['id_puja']),
            ]);
        } catch (Exception $e) {
            error_log('Ably error (nueva-puja): ' . $e->getMessage());
        }
    }

    private function emitirCierre($id_subasta, $ganador)
    {
        try {
            $ably    = new \Ably\AblyRest(Config::get('ABLY_KEY'));
            $channel = $ably->channels->get("subasta-$id_subasta");

            $channel->publish('subasta-cerrada', [
                'id_subasta' => intval($id_subasta),
                'ganador'    => $this->toArray($ganador),
                'estado'     => 'Finalizada',
            ]);
        } catch (Exception $e) {
            error_log('Ably error (subasta-cerrada): ' . $e->getMessage());
        }
    }
}
