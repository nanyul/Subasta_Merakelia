<?php

class SubastaModel
{
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    // TODAS LAS SUBASTAS (activas + finalizadas/canceladas)
    // Reutiliza getActivas() y getFinalizadas()
    // Retorna un array con dos claves: 'activas' y 'finalizadas'
    public function all()
    {
        return [
            'activas'     => $this->getActivas(),
            'finalizadas' => $this->getFinalizadas()
        ];
    }

    
    public function getActivas()
    {
        $vSql = "SELECT
                    s.id,
                    s.id_cuadro,
                    s.fecha_inicio,
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
}