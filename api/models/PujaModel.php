<?php

class PujaModel
{
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    // ─────────────────────────────────────────────
    // VALIDAR Y REGISTRAR PUJA
    // Retorna array con 'error' si falla, o datos completos si tiene éxito
    // ─────────────────────────────────────────────
    public function procesarPuja($monto, $id_usuario, $id_subasta)
    {
        $subastaM = new SubastaModel();

        // 1. Verificar cierre automático
        $subastaM->verificarCierre($id_subasta);

        // 2. Obtener datos actuales de la subasta
        $sqlSubasta = "SELECT s.id, s.id_estado_subasta, s.id_usuario AS id_vendedor,
                              s.precio_base, s.incremento_minimo
                       FROM subasta s
                       WHERE s.id = $id_subasta;";
        $resultSubasta = $this->enlace->ExecuteSQL($sqlSubasta);

        if (!is_array($resultSubasta) || count($resultSubasta) === 0) {
            return ['error' => 'La subasta no existe.'];
        }

        $subasta = $resultSubasta[0];

        // 3. Validar que esté Activa (1)
        if ($subasta->id_estado_subasta != 1) {
            return ['error' => 'La subasta no está activa. No se pueden registrar pujas.'];
        }

        // 4. Validar que el usuario no sea el vendedor
        if ($subasta->id_vendedor == $id_usuario) {
            return ['error' => 'El vendedor no puede realizar pujas en su propia subasta.'];
        }

        // 5. Obtener puja máxima actual
        $pujaMax    = $subastaM->getPujaMaxima($id_subasta);
        $montoActual = $pujaMax ? floatval($pujaMax->monto) : floatval($subasta->precio_base);

        // 6. Validar monto mayor a puja actual
        if (floatval($monto) <= $montoActual) {
            return ['error' => "El monto debe ser mayor a la puja actual: $" . number_format($montoActual, 2)];
        }

        // 7. Validar incremento mínimo
        $incrementoMin = floatval($subasta->incremento_minimo);
        $diferencia    = floatval($monto) - $montoActual;

        if ($diferencia < $incrementoMin) {
            $pujaMinima = $montoActual + $incrementoMin;
            return ['error' => "El incremento mínimo es $" . number_format($incrementoMin, 2) . ". Monto mínimo aceptado: $" . number_format($pujaMinima, 2)];
        }

        // 8. Registrar la puja
        $sql = "INSERT INTO puja (monto, id_usuario, id_subasta)
                VALUES ($monto, $id_usuario, $id_subasta);";
        $id_puja = $this->enlace->executeSQL_DML_last($sql);

        // 9. Retornar historial actualizado y nueva puja máxima
        return [
            'success'     => true,
            'id_puja'     => $id_puja,
            'puja_maxima' => $subastaM->getPujaMaxima($id_subasta),
            'historial'   => $subastaM->getHistorialPujas($id_subasta),
        ];
    }
}