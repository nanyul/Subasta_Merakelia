<?php

class SubastaModel
{
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    // TODAS LAS SUBASTAS
    public function all()
    {
        $programadas = $this->getProgramadas();
        $activas = $this->getActivas();
        $finalizadas = $this->getFinalizadas();

        return array_merge($programadas, $activas, $finalizadas);
    }

    
    public function getProgramadas()
    {
        $vSql = "SELECT
                    s.id,
                    s.id_cuadro,
                    s.id_estado_subasta,
                    s.fecha_inicio,
                    s.fecha_fin,
                    s.precio_base,
                    s.incremento_minimo
                 FROM subasta s
                 WHERE s.id_estado_subasta = 4
                 ORDER BY s.fecha_inicio DESC;";

        $vResultado = $this->enlace->ExecuteSQL($vSql);

        if ($vResultado) {
            if (is_array($vResultado) && count($vResultado) > 0) {
                $cuadroM = new CuadrosModel();
                $imageM  = new ImageModel();

                foreach ($vResultado as $subasta) {
                    $cuadro = $cuadroM->get($subasta->id_cuadro);
                    $subasta->objeto = ( is_array($cuadro) && count($cuadro) > 0) ? $cuadro[0]->nombre : null;

                    $subasta->imagen = $imageM->getImageCuadro($subasta->id_cuadro);

                    $sqlEstado = "SELECT descripcion FROM estado_subasta WHERE id = $subasta->id_estado_subasta;";
                    $estado = $this->enlace->ExecuteSQL($sqlEstado);
                    $subasta->estado = ( is_array($estado) && count($estado) > 0) ? $estado[0]->descripcion : null;

                    $subasta->cantidad_pujas = $this->CantidadPujas($subasta->id);

                    unset($subasta->id_cuadro);
                    unset($subasta->id_estado_subasta);
                }
            }
        }

        return $vResultado ? $vResultado : [];
    }

    
    public function getActivas()
    {
        $vSql = "SELECT
                    s.id,
                    s.id_cuadro,
                    s.fecha_inicio,
                     s.id_estado_subasta,
                    s.fecha_fin,
                    s.precio_base,
                    s.incremento_minimo
                 FROM subasta s
                 WHERE s.id_estado_subasta = 1
                 ORDER BY s.fecha_inicio DESC;";

        $vResultado = $this->enlace->ExecuteSQL($vSql);

        if ($vResultado) {
            if (is_array($vResultado) && count($vResultado) > 0) {
                $cuadroM = new CuadrosModel();
                $imageM  = new ImageModel();

                foreach ($vResultado as $subasta) {
                    $cuadro = $cuadroM->get($subasta->id_cuadro);
                    $subasta->objeto = ( is_array($cuadro) && count($cuadro) > 0) ? $cuadro[0]->nombre : null;

                    $subasta->imagen = $imageM->getImageCuadro($subasta->id_cuadro);

                    $subasta->cantidad_pujas = $this->CantidadPujas($subasta->id);

                    $subasta->estado = "Activa";

                    unset($subasta->id_cuadro);
                }
            }
        }

        return $vResultado ? $vResultado : [];
    }

   
    
    public function getFinalizadas()
    {
        $vSql = "SELECT
                    s.id,
                    s.id_cuadro,
                    s.id_estado_subasta,
                    s.fecha_inicio,
                    s.fecha_fin,
                    s.precio_base,
                    s.incremento_minimo
                 FROM subasta s
                 WHERE s.id_estado_subasta IN (2, 3)
                 ORDER BY s.fecha_fin DESC;";

        $vResultado = $this->enlace->ExecuteSQL($vSql);

        if ($vResultado) {
            if (is_array($vResultado) && count($vResultado) > 0) {
                $cuadroM = new CuadrosModel();
                $imageM  = new ImageModel();

                foreach ($vResultado as $subasta) {
                    $cuadro = $cuadroM->get($subasta->id_cuadro);
                    $subasta->objeto = ( is_array($cuadro) && count($cuadro) > 0) ? $cuadro[0]->nombre : null;

                    $subasta->imagen = $imageM->getImageCuadro($subasta->id_cuadro);

                    $sqlEstado = "SELECT descripcion FROM estado_subasta WHERE id = $subasta->id_estado_subasta;";
                    $estado = $this->enlace->ExecuteSQL($sqlEstado);
                    $subasta->estado = ( is_array($estado) && count($estado) > 0) ? $estado[0]->descripcion : null;

                    $subasta->cantidad_pujas = $this->CantidadPujas($subasta->id);


                    unset($subasta->id_cuadro);
                    unset($subasta->id_estado_subasta);
                }
            }
        }

        return $vResultado ? $vResultado : [];
    }


    public function get($id)
    {
        $vSql = "SELECT
                    s.id,
                    s.id_cuadro,
                    s.id_estado_subasta,
                    s.fecha_inicio,
                    s.fecha_fin,
                    s.precio_base,
                    s.incremento_minimo
                 FROM subasta s
                 WHERE s.id = $id;";

        $vResultado = $this->enlace->ExecuteSQL($vSql);

        if (!is_array($vResultado) || count($vResultado) === 0) {
            return null;
        }

        $detalle = $vResultado[0];

        $cuadroM    = new CuadrosModel();
        $imageM     = new ImageModel();
        $categoriaM = new CategoriasModel();

        $cuadro = $cuadroM->get($detalle->id_cuadro);
        if ( is_array($cuadro) && count($cuadro) > 0) {
            $detalle->objeto             = $cuadro[0]->nombre;
            $detalle->descripcion_cuadro = $cuadro[0]->descripcion;
            $detalle->condicion          = $cuadro[0]->estado_condicion;
        } else {
            $detalle->objeto             = null;
            $detalle->descripcion_cuadro = null;
            $detalle->condicion          = null;
        }

        $detalle->imagen = $imageM->getImageCuadro($detalle->id_cuadro);

        $categorias = $categoriaM->getByCuadro($detalle->id_cuadro);
        $detalle->categorias = array_column($categorias ?: [], 'descripcion');

        $sqlEstado = "SELECT descripcion FROM estado_subasta WHERE id = $detalle->id_estado_subasta;";
        $estado = $this->enlace->ExecuteSQL($sqlEstado);
        $detalle->estado = ( is_array($estado) && count($estado) > 0) ? $estado[0]->descripcion : null;

        $detalle->cantidad_pujas = $this->CantidadPujas($detalle->id);

        unset($detalle->id_cuadro);
        unset($detalle->id_estado_subasta);

        return $detalle;
    }

    
    // HISTORIAL DE PUJAS
    public function getHistorialPujas($id_subasta)
    {
        $sqlCheck = "SELECT id FROM subasta WHERE id = $id_subasta;";
        $check = $this->enlace->ExecuteSQL($sqlCheck);
        if (!is_array($check) || count($check) === 0) {
            return null;
        }

        $vSql = "SELECT
                    p.id,
                    p.id_usuario,
                    p.monto,
                    p.fecha_registro AS fecha_hora,
                    p.id_subasta
                 FROM puja p
                 WHERE p.id_subasta = $id_subasta
                 ORDER BY p.fecha_registro DESC;";

        $vResultado = $this->enlace->ExecuteSQL($vSql);

        if ($vResultado) {
            if (is_array($vResultado) && count($vResultado) > 0) {

                foreach ($vResultado as $puja) {
                    $sqlUsuario = "SELECT nombre FROM usuario WHERE id = $puja->id_usuario;";
                    $usuario = $this->enlace->ExecuteSQL($sqlUsuario);
                    $puja->usuario = (is_array($usuario) && count($usuario) > 0) ? $usuario[0]->nombre : null;

                    unset($puja->id_usuario);
                }
            }
        }

        return $vResultado ? $vResultado : [];
    }

    private function CantidadPujas($idSubasta)
    {
        $vSql = "SELECT COUNT(*) AS cantidad FROM puja WHERE id_subasta=$idSubasta";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        if ($vResultado) {
            return $vResultado[0]->cantidad;
        } else {
            return 0;
        }
    }

   
    // SUBASTAS POR CUADRO
    public function getSubastabyCuadro($id_cuadro)
    {
        $vSql = "SELECT
                    s.id,
                    s.id_estado_subasta,
                    s.fecha_inicio,
                    s.fecha_fin AS fecha_cierre
                FROM subasta s
                WHERE s.id_cuadro = $id_cuadro;";

        $vResultado = $this->enlace->ExecuteSQL($vSql);

        if ($vResultado) {
            if (is_array($vResultado) && count($vResultado) > 0) {
                foreach ($vResultado as $subasta) {
                    $sqlEstado = "SELECT descripcion FROM estado_subasta WHERE id = $subasta->id_estado_subasta;";
                    $estado = $this->enlace->ExecuteSQL($sqlEstado);
                    $subasta->estado_subasta = ( is_array($estado) && count($estado) > 0) ? $estado[0]->descripcion : null;

                    unset($subasta->id_estado_subasta);
                }
            }
        }

        return $vResultado ? $vResultado : [];
    }


    // CREAR SUBASTA
    public function create($objeto)
    {
        $sqlCuadro = "SELECT c.id, ec.descripcion AS estado_cuadro
                      FROM cuadro_subastable c
                      INNER JOIN estado_cuadro ec ON ec.id = c.id_estado_cuadro
                      WHERE c.id = $objeto->id_cuadro;";
 
        $cuadro = $this->enlace->ExecuteSQL($sqlCuadro);
 
        if (!is_array($cuadro) || count($cuadro) === 0) {
            return ["error" => "El objeto seleccionado no existe."];
        }
 
        if ($cuadro[0]->estado_cuadro !== "Publicado") {
            return ["error" => "El objeto seleccionado no está activo."];
        }
 
        $sqlCheck = "SELECT COUNT(*) AS total
                     FROM subasta
                     WHERE id_cuadro = $objeto->id_cuadro
                       AND id_estado_subasta = 1;";
 
        $check = $this->enlace->ExecuteSQL($sqlCheck);
        if (is_array($check) && $check[0]->total > 0) {
            return ["error" => "El objeto ya tiene una subasta activa."];
        }
 
        $sql = "INSERT INTO subasta (
                    fecha_inicio,
                    fecha_fin,
                    precio_base,
                    incremento_minimo,
                    descripcion,
                    es_publica,
                    id_estado_subasta,
                    id_usuario,
                    id_cuadro
                ) VALUES (
                    '$objeto->fecha_inicio',
                    '$objeto->fecha_fin',
                    $objeto->precio_base,
                    $objeto->incremento_minimo,
                    '$objeto->descripcion',
                    $objeto->es_publica,
                    $objeto->id_estado_subasta,
                    $objeto->id_usuario,
                    $objeto->id_cuadro
                );";
 
        $idSubasta = $this->enlace->executeSQL_DML_last($sql);
 
        return $this->get($idSubasta);
    }
 

    // EDITAR SUBASTA
    public function update($objeto)
    {
        $sqlCheck = "SELECT
                        s.fecha_inicio,
                        s.id_estado_subasta,
                        (SELECT COUNT(*) FROM puja WHERE id_subasta = s.id) AS cantidad_pujas
                     FROM subasta s
                     WHERE s.id = $objeto->id;";
 
        $check = $this->enlace->ExecuteSQL($sqlCheck);
 
        if (!is_array($check) || count($check) === 0) {
            return ["error" => "La subasta no existe."];
        }
 
        try {
            $timezone = new DateTimeZone('UTC');
            $ahora  = new DateTime('now', $timezone);
            $inicio = new DateTime($check[0]->fecha_inicio, $timezone);
        } catch (Exception $e) {
            return ["error" => "Error al procesar fechas."];
        }
 
        if ($inicio <= $ahora) {
            return ["error" => "No se puede editar: la subasta ya ha iniciado."];
        }
 
        if ($check[0]->cantidad_pujas > 0) {
            return ["error" => "No se puede editar: la subasta ya tiene pujas registradas."];
        }
 
        $sql = "UPDATE subasta SET
                    fecha_inicio      = '$objeto->fecha_inicio',
                    fecha_fin         = '$objeto->fecha_fin',
                    precio_base       = $objeto->precio_base,
                    incremento_minimo = $objeto->incremento_minimo
                WHERE id = $objeto->id;";
 
        $this->enlace->executeSQL_DML($sql);
 
        return $this->get($objeto->id);
    }
 

    // PUBLICAR SUBASTA
    public function publish($id)
    {
        $sqlCheck = "SELECT
                        s.id_estado_subasta,
                        s.fecha_inicio
                     FROM subasta s
                     WHERE s.id = $id;";
 
        $check = $this->enlace->ExecuteSQL($sqlCheck);
 
        if (!is_array($check) || count($check) === 0) {
            return ["error" => "La subasta no existe."];
        }
 
        if ($check[0]->id_estado_subasta != 4) {
            return ["error" => "Solo se pueden publicar subastas en estado Programada."];
        }
 
        try {
            $timezone = new DateTimeZone('UTC');
            $ahora  = new DateTime('now', $timezone);
            $inicio = new DateTime($check[0]->fecha_inicio, $timezone);
        } catch (Exception $e) {
            return ["error" => "Error al procesar fechas."];
        }
 
        if ($inicio < $ahora) {
            return ["error" => "No se puede publicar: la fecha de inicio ya pasó."];
        }
 
        $sql = "UPDATE subasta
                SET id_estado_subasta = 1
                WHERE id = $id;";
 
        $this->enlace->executeSQL_DML($sql);
 
        return $this->get($id);
    }
 

    // CANCELAR SUBASTA
    public function cancel($id)
    {
        $sql = "UPDATE subasta
                SET id_estado_subasta = 3
                WHERE id = $id;";
 
        $this->enlace->executeSQL_DML($sql);
 
        return $this->get($id);
    }

    public function cancelarSubasta($id){
        $sql = "UPDATE subasta
                SET id_estado_subasta = 3
                WHERE id = $id;";
 
        $this->enlace->executeSQL_DML($sql);
 
        return $this->get($id);
    }


// VERIFICAR SI DEBERÍA ESTAR CERRADA
public function deberiaCerrarse($id_subasta)
{
    $sqlCheck = "SELECT id, id_estado_subasta, fecha_fin
                FROM subasta
                WHERE id = $id_subasta;";
    $result = $this->enlace->ExecuteSQL($sqlCheck);

    if (!is_array($result) || count($result) === 0) return false;

    $subasta = $result[0];

    if ($subasta->id_estado_subasta != 1) return false;

    try {
        $ahora = new DateTime('now', new DateTimeZone('UTC'));
        $fin   = new DateTime($subasta->fecha_fin, new DateTimeZone('UTC'));

        return $ahora > $fin;
    } catch (Exception $e) {
        return false;
    }
}

// ACTIVAR SUBASTAS PROGRAMADAS
public function activarTodasLasListas()
{
    try {
        $sql = "UPDATE subasta 
                SET id_estado_subasta = 1 
                WHERE id_estado_subasta = 4 
                  AND fecha_inicio <= NOW();";

        if (method_exists($this->enlace, 'executeSQL_DML')) {
            @$this->enlace->executeSQL_DML($sql);
        }
    } catch (Exception $e) {
    }
}

// OBTENER SUBASTAS CON PAGO PENDIENTE
public function getPendientesPago()
{
    $vSql = "SELECT
                s.id,
                s.id_cuadro,
                s.id_estado_subasta,
                s.fecha_inicio,
                s.fecha_fin,
                s.precio_base,
                s.incremento_minimo
             FROM subasta s
             WHERE s.id_estado_subasta = 5
             ORDER BY s.fecha_fin DESC;";

    $vResultado = $this->enlace->ExecuteSQL($vSql);

    if ($vResultado) {
        if (is_array($vResultado) && count($vResultado) > 0) {
            $cuadroM = new CuadrosModel();
            $imageM  = new ImageModel();

            foreach ($vResultado as $subasta) {
                $cuadro = $cuadroM->get($subasta->id_cuadro);
                $subasta->objeto = ( is_array($cuadro) && count($cuadro) > 0) ? $cuadro[0]->nombre : null;

                $subasta->imagen = $imageM->getImageCuadro($subasta->id_cuadro);

                $sqlEstado = "SELECT descripcion FROM estado_subasta WHERE id = $subasta->id_estado_subasta;";
                $estado = $this->enlace->ExecuteSQL($sqlEstado);
                $subasta->estado = ( is_array($estado) && count($estado) > 0) ? $estado[0]->descripcion : null;

                $subasta->cantidad_pujas = $this->CantidadPujas($subasta->id);

                $pujaMaxima = $this->getPujaMaxima($subasta->id);
                $subasta->puja_maxima = $pujaMaxima;

                unset($subasta->id_cuadro);
                unset($subasta->id_estado_subasta);
            }
        }
    }

    return $vResultado ? $vResultado : [];
}

// CAMBIAR A PENDIENTE PAGO
public function cambiarAPendientePago($idSubasta)
{
    try {
        $sql = "UPDATE subasta 
                SET id_estado_subasta = 5 
                WHERE id = $idSubasta AND id_estado_subasta = 2;";

        if (method_exists($this->enlace, 'executeSQL_DML')) {
            @$this->enlace->executeSQL_DML($sql);
        }
    } catch (Exception $e) {
        error_log('Error en cambiarAPendientePago: ' . $e->getMessage());
    }
}

// CERRAR TODAS LAS SUBASTAS VENCIDAS
public function cerrarTodasLasVencidas()
{
    try {
        $sql = "UPDATE subasta 
                SET id_estado_subasta = 2 
                WHERE id_estado_subasta = 1 
                  AND fecha_fin < NOW();";

        if (method_exists($this->enlace, 'executeSQL_DML')) {
            @$this->enlace->executeSQL_DML($sql);
        }
    } catch (Exception $e) {
    }
}

// CIERRE AUTOMÁTICO
public function cerrarSiVencio($id_subasta)
{
    if (!$this->deberiaCerrarse($id_subasta)) {
        return false;
    }

    $this->enlace->executeSQL_DML(
        "UPDATE subasta SET id_estado_subasta = 2 WHERE id = $id_subasta;"
    );
    return true;
}

// CIERRE AUTOMÁTICO (DEPRECATED)
public function verificarCierre($id_subasta)
{
    return $this->deberiaCerrarse($id_subasta);
}

// PUJA MÁS ALTA
public function getPujaMaxima($id_subasta)
{
    $vSql = "SELECT p.id, p.monto, p.id_usuario, u.nombre AS nombre_usuario
             FROM puja p
             INNER JOIN usuario u ON u.id = p.id_usuario
             WHERE p.id_subasta = $id_subasta
             ORDER BY p.monto DESC
             LIMIT 1;";

    $result = $this->enlace->ExecuteSQL($vSql);

    return (is_array($result) && count($result) > 0) ? $result[0] : null;
}

// VENDEDOR
public function getVendedor($id_subasta)
{
    $vSql = "SELECT u.id, u.nombre
             FROM subasta s
             INNER JOIN usuario u ON u.id = s.id_usuario
             WHERE s.id = $id_subasta;";

    $result = $this->enlace->ExecuteSQL($vSql);

    return (is_array($result) && count($result) > 0) ? $result[0] : null;
}

// DETALLE COMPLETO
public function getDetalleActiva($id)
{
    $detalle = $this->get($id);
    if ($detalle === null) return null;

    $vendedor = $this->getVendedor($id);
    $detalle->id_vendedor     = $vendedor ? $vendedor->id   : null;
    $detalle->nombre_vendedor = $vendedor ? $vendedor->nombre : null;

    $detalle->historial    = $this->getHistorialPujas($id) ?: [];
    $detalle->puja_maxima  = $this->getPujaMaxima($id);
    $detalle->deberiaCerrarse = $this->deberiaCerrarse($id);

    return $detalle;
}



    

}