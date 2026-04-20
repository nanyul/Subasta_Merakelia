<?php

class SubastaModel
{
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    // TODAS LAS SUBASTAS (programadas + activas + finalizadas/canceladas)
    // Reutiliza getProgramadas(), getActivas() y getFinalizadas()
    // Retorna un array con todas las subastas
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
                    // Nombre del cuadro
                    $cuadro = $cuadroM->get($subasta->id_cuadro);
                    $subasta->objeto = ( is_array($cuadro) && count($cuadro) > 0) ? $cuadro[0]->nombre : null;

                    // Imagen principal del cuadro
                    $subasta->imagen = $imageM->getImageCuadro($subasta->id_cuadro);

                    // Estado de la subasta
                    $sqlEstado = "SELECT descripcion FROM estado_subasta WHERE id = $subasta->id_estado_subasta;";
                    $estado = $this->enlace->ExecuteSQL($sqlEstado);
                    $subasta->estado = ( is_array($estado) && count($estado) > 0) ? $estado[0]->descripcion : null;

                    // Cantidad de pujas 
                    $subasta->cantidad_pujas = $this->CantidadPujas($subasta->id);

                    // Limpiar campos innecesarios
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
                    // Nombre del cuadro
                    $cuadro = $cuadroM->get($subasta->id_cuadro);
                    $subasta->objeto = ( is_array($cuadro) && count($cuadro) > 0) ? $cuadro[0]->nombre : null;

                    // Imagen principal del cuadro
                    $subasta->imagen = $imageM->getImageCuadro($subasta->id_cuadro);

                    // Cantidad de pujas 
                    $subasta->cantidad_pujas = $this->CantidadPujas($subasta->id);

                    
                    $subasta->estado = "Activa";  // ← LÍNEA SIMPLE

                    // Limpiar campos innecesarios
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
                    // Nombre del cuadro
                    $cuadro = $cuadroM->get($subasta->id_cuadro);
                    $subasta->objeto = ( is_array($cuadro) && count($cuadro) > 0) ? $cuadro[0]->nombre : null;

                    // Imagen principal del cuadro
                    $subasta->imagen = $imageM->getImageCuadro($subasta->id_cuadro);

                    // Estado de la subasta
                    $sqlEstado = "SELECT descripcion FROM estado_subasta WHERE id = $subasta->id_estado_subasta;";
                    $estado = $this->enlace->ExecuteSQL($sqlEstado);
                    $subasta->estado = ( is_array($estado) && count($estado) > 0) ? $estado[0]->descripcion : null;

                    // Cantidad de pujas 
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

        // Datos del cuadro: nombre, descripcion, condicion usando CuadrosModel
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

        // Imagen principal 
        $detalle->imagen = $imageM->getImageCuadro($detalle->id_cuadro);

        // Categorías del cuadro (array anidado) 
        $categorias = $categoriaM->getByCuadro($detalle->id_cuadro);
        $detalle->categorias = array_column($categorias ?: [], 'descripcion');

        // Estado de la subasta
        $sqlEstado = "SELECT descripcion FROM estado_subasta WHERE id = $detalle->id_estado_subasta;";
        $estado = $this->enlace->ExecuteSQL($sqlEstado);
        $detalle->estado = ( is_array($estado) && count($estado) > 0) ? $estado[0]->descripcion : null;

        // Cantidad de pujas
        $detalle->cantidad_pujas = $this->CantidadPujas($detalle->id);

        unset($detalle->id_cuadro);
        unset($detalle->id_estado_subasta);

        return $detalle;
    }

    
    // HISTORIAL DE PUJAS de una subasta
    // Orden cronológico DESCENDENTE (más reciente primero)
    // Incluye: usuario, monto, fecha_hora
    public function getHistorialPujas($id_subasta)
    {
        // Verificar que la subasta exista
        $sqlCheck = "SELECT id FROM subasta WHERE id = $id_subasta;";
        $check = $this->enlace->ExecuteSQL($sqlCheck);
        if (!is_array($check) || count($check) === 0) {
            return null; // Subasta no encontrada
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

   
    // SUBASTAS EN LAS QUE HA PARTICIPADO UN CUADRO
    // Historial mínimo: id subasta, fecha_inicio,
    //                   fecha_cierre, estado
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
                    // Estado de cada subasta
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
    // Validaciones directas en SQL (evita dependencia circular con CuadrosModel)
    // Estado inicial: 4 = Programada (borrador)
    // id_usuario viene del front como variable lógica simulada
    public function create($objeto)
    {
        // Validar que el cuadro exista y esté activo
        // Se consulta directamente para evitar dependencia circular con CuadrosModel
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
 
        // Validar que el cuadro no tenga ya una subasta activa (estado 1 = Activa)
        $sqlCheck = "SELECT COUNT(*) AS total
                     FROM subasta
                     WHERE id_cuadro = $objeto->id_cuadro
                       AND id_estado_subasta = 1;";
 
        $check = $this->enlace->ExecuteSQL($sqlCheck);
        if (is_array($check) && $check[0]->total > 0) {
            return ["error" => "El objeto ya tiene una subasta activa."];
        }
 
        // Insertar la subasta
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
    // Solo permitido si: no ha iniciado Y no tiene pujas
    // Campos editables: fecha_inicio, fecha_fin, precio_base, incremento_minimo
    // Validaciones directas en SQL (se evita llamar a get() antes de editar)
    public function update($objeto)
    {
        // Verificar existencia + fecha_inicio + cantidad_pujas en una sola consulta
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
 
        // Actualizar solo los campos permitidos
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
    // Cambia estado: Programada (4) → Activa (1)
    // Solo si fecha_inicio es válida (no en el pasado)
    public function publish($id)
    {
        // Verificar existencia + estado actual + fecha_inicio en una sola consulta
        $sqlCheck = "SELECT
                        s.id_estado_subasta,
                        s.fecha_inicio
                     FROM subasta s
                     WHERE s.id = $id;";
 
        $check = $this->enlace->ExecuteSQL($sqlCheck);
 
        if (!is_array($check) || count($check) === 0) {
            return ["error" => "La subasta no existe."];
        }
 
        // Solo se puede publicar si está en estado Programada (4 = borrador)
        if ($check[0]->id_estado_subasta != 4) {
            return ["error" => "Solo se pueden publicar subastas en estado Programada."];
        }
 
        // La fecha de inicio no puede estar en el pasado
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
 
        // Cambiar estado a Activa (1)
        $sql = "UPDATE subasta
                SET id_estado_subasta = 1
                WHERE id = $id;";
 
        $this->enlace->executeSQL_DML($sql);
 
        return $this->get($id);
    }
 

    // CANCELAR SUBASTA
    // Cambia estado a Cancelada (3)
    public function cancel($id)
    {
        // Cambiar estado a Cancelada (3)
        $sql = "UPDATE subasta
                SET id_estado_subasta = 3
                WHERE id = $id;";
 
        $this->enlace->executeSQL_DML($sql);
 
        return $this->get($id);
    }

    public function cancelarSubasta($id){
         
        // Cambiar estado a Cancelada (3)
        $sql = "UPDATE subasta
                SET id_estado_subasta = 3
                WHERE id = $id;";
 
        $this->enlace->executeSQL_DML($sql);
 
        return $this->get($id);
    }



// VERIFICAR SI DEBERÍA ESTAR CERRADA (solo consulta, no modifica)
// Retorna true/false sin cambiar la base de datos
public function deberiaCerrarse($id_subasta)
{
    $sqlCheck = "SELECT id, id_estado_subasta, fecha_fin
                FROM subasta
                WHERE id = $id_subasta;";
    $result = $this->enlace->ExecuteSQL($sqlCheck);

    if (!is_array($result) || count($result) === 0) return false;

    $subasta = $result[0];

    // Solo verificar si está activa (id_estado_subasta = 1)
    if ($subasta->id_estado_subasta != 1) return false;

    try {
        $timezone = new DateTimeZone('UTC');
        $ahora = new DateTime('now', $timezone);
        $fin   = new DateTime($subasta->fecha_fin, $timezone);

        return $ahora > $fin; // true si ya venció
    } catch (Exception $e) {
        return false;
    }
}


// ACTIVAR SUBASTAS PROGRAMADAS
// Cambiar estado Programada(4) → Activa(1) cuando llegue fecha_inicio
// Usa NOW() de SQL para mayor compatibilidad
public function activarTodasLasListas()
{
    try {
        // Usar NOW() de SQL para comparación
        // Subastas con estado 4 (Programada) cuya fecha_inicio ya pasó → cambiar a 1 (Activa)
        $sql = "UPDATE subasta 
                SET id_estado_subasta = 1 
                WHERE id_estado_subasta = 4 
                  AND fecha_inicio <= NOW();";

        // Ejecutar sin lanzar excepciones si falla
        if (method_exists($this->enlace, 'executeSQL_DML')) {
            @$this->enlace->executeSQL_DML($sql);
        }
    } catch (Exception $e) {
        // Silencioso
    }
}

// Obtener subastas con PAGO PENDIENTE (estado 5)
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
                // Nombre del cuadro
                $cuadro = $cuadroM->get($subasta->id_cuadro);
                $subasta->objeto = ( is_array($cuadro) && count($cuadro) > 0) ? $cuadro[0]->nombre : null;

                // Imagen principal del cuadro
                $subasta->imagen = $imageM->getImageCuadro($subasta->id_cuadro);

                // Estado de la subasta
                $sqlEstado = "SELECT descripcion FROM estado_subasta WHERE id = $subasta->id_estado_subasta;";
                $estado = $this->enlace->ExecuteSQL($sqlEstado);
                $subasta->estado = ( is_array($estado) && count($estado) > 0) ? $estado[0]->descripcion : null;

                // Cantidad de pujas 
                $subasta->cantidad_pujas = $this->CantidadPujas($subasta->id);

                // Obtener la puja máxima (ganador)
                $pujaMaxima = $this->getPujaMaxima($subasta->id);
                $subasta->puja_maxima = $pujaMaxima;

                unset($subasta->id_cuadro);
                unset($subasta->id_estado_subasta);
            }
        }
    }

    return $vResultado ? $vResultado : [];
}

// Cambio a PENDIENTE PAGO (estado 5)
// Se ejecuta después de que se anuncia el ganador
public function cambiarAPendientePago($idSubasta)
{
    try {
        $sql = "UPDATE subasta 
                SET id_estado_subasta = 5 
                WHERE id = $idSubasta AND id_estado_subasta = 2;";

        // Ejecutar sin lanzar excepciones si falla
        if (method_exists($this->enlace, 'executeSQL_DML')) {
            @$this->enlace->executeSQL_DML($sql);
        }
    } catch (Exception $e) {
        error_log('Error en cambiarAPendientePago: ' . $e->getMessage());
    }
}


// CERRAR TODAS LAS SUBASTAS VENCIDAS
// Actualiza estado de todas las subastas que vencieron (1 → 2)
// Usa NOW() de SQL para mayor compatibilidad
public function cerrarTodasLasVencidas()
{
    try {
        // Usar NOW() de SQL para comparación
        $sql = "UPDATE subasta 
                SET id_estado_subasta = 2 
                WHERE id_estado_subasta = 1 
                  AND fecha_fin < NOW();";

        // Ejecutar sin lanzar excepciones si falla
        if (method_exists($this->enlace, 'executeSQL_DML')) {
            @$this->enlace->executeSQL_DML($sql);
        }
    } catch (Exception $e) {
        // Silencioso
    }
}


// CIERRE AUTOMÁTICO - MODIFICA LA BD
// Solo llamar explícitamente cuando sea necesario (cron, webhook, etc)
// NO llamar en métodos GET
public function cerrarSiVencio($id_subasta)
{
    if (!$this->deberiaCerrarse($id_subasta)) {
        return false;
    }

    // Actualizar estado a Finalizada (2)
    $this->enlace->executeSQL_DML(
        "UPDATE subasta SET id_estado_subasta = 2 WHERE id = $id_subasta;"
    );
    return true;
}


// CIERRE AUTOMÁTICO (DEPRECATED - Para compatibilidad)
// Cambia estado Activa(1) → Finalizada(2) si venció fecha_fin
// Retorna true si se acaba de cerrar
// ⚠️ NO USAR EN GET REQUESTS - USAR cerrarSiVencio() explícitamente
public function verificarCierre($id_subasta)
{
    // Solo verifica, no modifica
    return $this->deberiaCerrarse($id_subasta);
}


// PUJA MÁS ALTA de una subasta
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


// VENDEDOR de una subasta
public function getVendedor($id_subasta)
{
    $vSql = "SELECT u.id, u.nombre
             FROM subasta s
             INNER JOIN usuario u ON u.id = s.id_usuario
             WHERE s.id = $id_subasta;";

    $result = $this->enlace->ExecuteSQL($vSql);

    return (is_array($result) && count($result) > 0) ? $result[0] : null;
}


// DETALLE COMPLETO para la pantalla de subasta
// ⚠️ NO MODIFICA EL ESTADO - Solo consulta y retorna datos
public function getDetalleActiva($id)
{
    // ⚠️ IMPORTANTE: NO llamar a verificarCierre() aquí
    // Si la subasta debería estar cerrada, el cliente lo detectará por la fecha
    // El cierre debe ser explícito a través de cron o endpoint POST

    $detalle = $this->get($id);
    if ($detalle === null) return null;

    $vendedor = $this->getVendedor($id);
    $detalle->id_vendedor     = $vendedor ? $vendedor->id   : null;
    $detalle->nombre_vendedor = $vendedor ? $vendedor->nombre : null;

    $detalle->historial    = $this->getHistorialPujas($id) ?: [];
    $detalle->puja_maxima  = $this->getPujaMaxima($id);
    $detalle->deberiaCerrarse = $this->deberiaCerrarse($id); // Solo INFO, no modifica

    return $detalle;
}



    

}