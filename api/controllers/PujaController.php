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

            if ($result->recien_cerrada) {
                $this->emitirCierre($param, $subastaM->getPujaMaxima($param));
            }

            $response->toJSON($result);
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
