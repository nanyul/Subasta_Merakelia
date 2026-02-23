<?php

class SubastaModel
{
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

   
    // LISTADO DE SUBASTAS ACTIVAS (id_estado_subasta = 1)
    // Incluye: nombre del cuadro, imagen, fecha_inicio,
    //          fecha_fin, precio_base, incremento_minimo,
    //          cantidad_pujas (calculado)
    public function getActivas()
    {
        $vSql = "SELECT
                    s.id,
                    c.nombre               AS objeto,
                    i.datos                AS imagen,
                    s.fecha_inicio,
                    s.fecha_fin,
                    s.precio_base,
                    s.incremento_minimo,
                    COUNT(p.id)            AS cantidad_pujas
                 FROM subasta s
                 INNER JOIN cuadro_subastable c  ON c.id = s.id_cuadro
                 LEFT  JOIN cuadro_imagen     ci ON ci.id_cuadro = c.id
                 LEFT  JOIN imagen            i  ON i.id = ci.id_imagen
                 LEFT  JOIN puja              p  ON p.id_subasta = s.id
                 WHERE s.id_estado_subasta = 1
                 GROUP BY s.id, c.nombre, i.datos,
                          s.fecha_inicio, s.fecha_fin,
                          s.precio_base, s.incremento_minimo
                 ORDER BY s.fecha_inicio DESC;";

        $vResultado = $this->enlace->ExecuteSQL($vSql);
        return $vResultado ? $vResultado : [];
    }

    
    // LISTADO DE SUBASTAS FINALIZADAS/CANCELADAS
    // (id_estado_subasta IN (2, 3))
    // Incluye: objeto, imagen, fecha_fin (obligatorio),
    //          cantidad_pujas (obligatorio), estado (obligatorio),
    //          precio_base, incremento_minimo
    public function getFinalizadas()
    {
        $vSql = "SELECT
                    s.id,
                    c.nombre               AS objeto,
                    i.datos                AS imagen,
                    s.fecha_fin,
                    es.descripcion         AS estado,
                    s.precio_base,
                    s.incremento_minimo,
                    COUNT(p.id)            AS cantidad_pujas
                 FROM subasta s
                 INNER JOIN cuadro_subastable c  ON c.id = s.id_cuadro
                 INNER JOIN estado_subasta    es ON es.id = s.id_estado_subasta
                 LEFT  JOIN cuadro_imagen     ci ON ci.id_cuadro = c.id
                 LEFT  JOIN imagen            i  ON i.id = ci.id_imagen
                 LEFT  JOIN puja              p  ON p.id_subasta = s.id
                 WHERE s.id_estado_subasta IN (2, 3)
                 GROUP BY s.id, c.nombre, i.datos, s.fecha_fin,
                          es.descripcion, s.precio_base, s.incremento_minimo
                 ORDER BY s.fecha_fin DESC;";

        $vResultado = $this->enlace->ExecuteSQL($vSql);
        return $vResultado ? $vResultado : [];
    }

    
    // DETALLE DE UNA SUBASTA
    // Incluye toda la info del cuadro + datos de subasta
    // + cantidad_pujas (calculado)
    public function getDetalle($id)
    {
        // Datos principales de la subasta y el cuadro
        $vSql = "SELECT
                    s.id,
                    s.fecha_inicio,
                    s.fecha_fin,
                    s.precio_base,
                    s.incremento_minimo,
                    es.descripcion         AS estado,
                    c.nombre               AS objeto,
                    c.descripcion          AS descripcion_cuadro,
                    i.datos                AS imagen,
                    ec.descripcion         AS condicion,
                    COUNT(p.id)            AS cantidad_pujas
                 FROM subasta s
                 INNER JOIN cuadro_subastable c  ON c.id = s.id_cuadro
                 INNER JOIN estado_subasta    es ON es.id = s.id_estado_subasta
                 INNER JOIN estado_condicion  ec ON ec.id = c.id_estado_condicion
                 LEFT  JOIN cuadro_imagen     ci ON ci.id_cuadro = c.id
                 LEFT  JOIN imagen            i  ON i.id = ci.id_imagen
                 LEFT  JOIN puja              p  ON p.id_subasta = s.id
                 WHERE s.id = $id
                 GROUP BY s.id, s.fecha_inicio, s.fecha_fin, s.precio_base,
                          s.incremento_minimo, es.descripcion, c.nombre,
                          c.descripcion, i.datos, ec.descripcion;";

        $vResultado = $this->enlace->ExecuteSQL($vSql);

        if (!is_array($vResultado) || count($vResultado) === 0) {
            return null;
        }

        $detalle = $vResultado[0];

        //  Categorías del cuadro (subconsulta separada)
        $vSqlCategorias = "SELECT cat.descripcion
                           FROM cuadro_subastable c
                           INNER JOIN subasta         s   ON s.id_cuadro   = c.id
                           INNER JOIN cuadro_categoria cc ON cc.id_cuadro  = c.id
                           INNER JOIN categoria        cat ON cat.id       = cc.id_categoria
                           WHERE s.id = $id;";

        $categorias = $this->enlace->ExecuteSQL($vSqlCategorias);
        $detalle->categorias = $categorias ? $categorias : [];

        return $detalle;
    }

    // HISTORIAL DE PUJAS de una subasta
    // Orden cronológico DESCENDENTE (más reciente primero)
    // Incluye: usuario, monto, fecha_hora
   
    public function getHistorialPujas($id_subasta)
    {
        // Validar que la subasta exista antes de devolver pujas
        $vSqlCheck = "SELECT id FROM subasta WHERE id = $id_subasta;";
        $check = $this->enlace->ExecuteSQL($vSqlCheck);

        if (!is_array($check) || count($check) === 0) {
            return null; // Subasta no encontrada
        }

        $vSql = "SELECT
                    u.nombre               AS usuario,
                    p.monto,
                    p.fecha_registro       AS fecha_hora,
                    p.id_subasta
                 FROM puja p
                 INNER JOIN usuario u ON u.id = p.id_usuario
                 WHERE p.id_subasta = $id_subasta
                 ORDER BY p.fecha_registro DESC;"; // Orden: más reciente primero

        $vResultado = $this->enlace->ExecuteSQL($vSql);
        return $vResultado ? $vResultado : [];
    }
}
