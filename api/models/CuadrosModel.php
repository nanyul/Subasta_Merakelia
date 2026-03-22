<?php
class CuadrosModel
{
    public $enlace;
    public function __construct()
    {

        $this->enlace = new MySqlConnect();
    }
    public function all()
    {
        
        $vSql = "SELECT c.id, c.nombre, c.descripcion, c.nombre_artista, c.ano_creacion, c.tecnica, 
        c.dimensiones, c.material_soporte, c.procedencia, c.certificado_autenticidad, c.fecha_registro, 
        c.valor_estimado, ROUND(c.valor_estimado * 510, 2) AS valor_estimado_colones,
        CASE c.id_estado_cuadro
            WHEN 1 THEN 'Publicado'
            WHEN 2 THEN 'Reservado'
            ELSE 'Retirado'
        END AS estado_cuadro,
        IF(c.id_estado_condicion = 1, 'Nuevo', 'Usado') AS estado_condicion,
        u.nombre AS nombre_dueno
        FROM cuadro_subastable c
        INNER JOIN usuario u ON u.id = c.id_usuario;";

        //vResultado es un array de objetos = JSON
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        if ($vResultado) { //Sino es Null
            if (is_array($vResultado) && count($vResultado) > 0) { //Si el resultado es un array y tiene elementos
                $categoriaM = new CategoriasModel(); 
                $imageM = new ImageModel(); 
                foreach ($vResultado as $cuadro) {
                    $categorias = $categoriaM->getByCuadro($cuadro->id);
                    // Devolver array de categorías con id y descripcion
                    $cuadro->categorias = $categorias ?: [];
                    $cuadro->imagen = $imageM->getImageCuadro($cuadro->id);
                }
            }
        }
   
        return $vResultado;
    }

    public function get($id)
    {
        $vSql = "SELECT c.id, c.nombre, c.descripcion, c.nombre_artista, c.ano_creacion, c.tecnica, 
        c.dimensiones, c.material_soporte, c.procedencia, c.certificado_autenticidad, c.fecha_registro, 
        c.valor_estimado, c.id_estado_condicion, c.id_estado_cuadro, c.id_usuario,
        ROUND(c.valor_estimado * 510, 2) AS valor_estimado_colones,
        CASE c.id_estado_cuadro
            WHEN 1 THEN 'Publicado'
            WHEN 2 THEN 'Reservado'
            ELSE 'Retirado'
        END AS estado_cuadro,
        IF(c.id_estado_condicion = 1, 'Nuevo', 'Usado') AS estado_condicion,
        u.nombre AS nombre_dueno
        FROM cuadro_subastable c
        INNER JOIN usuario u ON u.id = c.id_usuario
        WHERE c.id = $id";

        //vResultado es un array de objetos = JSON
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        if ($vResultado) { //Sino es Null
            if (is_array($vResultado) && count($vResultado) > 0) { //Si el resultado es un array y tiene elementos
                $categoriaM = new CategoriasModel();
                $imageM = new ImageModel(); 
                $subastaM = new SubastaModel(); 
                foreach ($vResultado as $cuadro) {
                    $categorias = $categoriaM->getByCuadro($cuadro->id); // Usar id del cuadro
                    // Devolver array de categorías con id y descripcion
                    $cuadro->categorias = $categorias ?: [];
                    $cuadro->imagen = $imageM->getImageCuadro($cuadro->id);
                    $cuadro->imagenes = $imageM->getAllImagesCuadro($cuadro->id);

                    $cuadro->subasta = $subastaM->getSubastabyCuadro($cuadro->id);
                }

            }
        }

        return $vResultado;
        
    }

    
    //MANTENIMIENTOS

	public function create($objeto)
	{
		// Preparar año de creación - si es null, vacío, 0, o fuera de rango, usar NULL en SQL
		$ano_creacion = (isset($objeto->ano_creacion) && $objeto->ano_creacion && $objeto->ano_creacion != 0) 
			? intval($objeto->ano_creacion) 
			: "NULL";
		
		// Validar rango de año (MySQL YEAR acepta 1901-2155)
		if ($ano_creacion !== "NULL" && ($ano_creacion < 1901 || $ano_creacion > 2155)) {
			$ano_creacion = "NULL";
		}
		
		$sql = "INSERT INTO cuadro_subastable (nombre, descripcion, nombre_artista, ano_creacion, " .
			"tecnica, dimensiones, material_soporte, procedencia, certificado_autenticidad, " .
			"valor_estimado, id_estado_cuadro, id_estado_condicion, id_usuario) " .
			"VALUES ('$objeto->nombre', '$objeto->descripcion', '$objeto->nombre_artista', " .
			"$ano_creacion, '$objeto->tecnica', '$objeto->dimensiones', " .
			"'$objeto->material_soporte', '$objeto->procedencia', $objeto->certificado_autenticidad, " .
			"$objeto->valor_estimado, $objeto->id_estado_cuadro, " .
			"$objeto->id_estado_condicion, $objeto->id_usuario)";

		$idCuadro = $this->enlace->executeSQL_DML_last($sql);

		// Asociar categorías si existen
		foreach ($objeto->categorias as $value) {
			$sql = "INSERT INTO cuadro_categoria (id_cuadro, id_categoria) VALUES ($idCuadro, $value)";
			$this->enlace->executeSQL_DML($sql);
		}

		return $this->get($idCuadro);
	}

	public function update($objeto)
	{
		// Preparar año de creación - si es null, vacío, 0, o fuera de rango, usar NULL en SQL
		$ano_creacion = (isset($objeto->ano_creacion) && $objeto->ano_creacion && $objeto->ano_creacion != 0) 
			? intval($objeto->ano_creacion) 
			: "NULL";
		
		// Validar rango de año (MySQL YEAR acepta 1901-2155)
		if ($ano_creacion !== "NULL" && ($ano_creacion < 1901 || $ano_creacion > 2155)) {
			$ano_creacion = "NULL";
		}

		// Convertir valores numéricos
		$valor_estimado = isset($objeto->valor_estimado) ? floatval($objeto->valor_estimado) : 0;
		$certificado_autenticidad = isset($objeto->certificado_autenticidad) ? intval($objeto->certificado_autenticidad) : 0;
		$id_estado_cuadro = isset($objeto->id_estado_cuadro) ? intval($objeto->id_estado_cuadro) : 1;
		$id_estado_condicion = isset($objeto->id_estado_condicion) ? intval($objeto->id_estado_condicion) : 1;

		$sql = "UPDATE cuadro_subastable SET " .
			"nombre='$objeto->nombre', " .
			"descripcion='$objeto->descripcion', " .
			"nombre_artista='$objeto->nombre_artista', " .
			"ano_creacion=$ano_creacion, " .
			"tecnica='$objeto->tecnica', " .
			"dimensiones='$objeto->dimensiones', " .
			"material_soporte='$objeto->material_soporte', " .
			"procedencia='$objeto->procedencia', " .
			"certificado_autenticidad=$certificado_autenticidad, " .
			"valor_estimado=$valor_estimado, " .
			"id_estado_cuadro=$id_estado_cuadro, " .
			"id_estado_condicion=$id_estado_condicion " .
			"WHERE id=$objeto->id";

		$this->enlace->executeSQL_DML($sql);

		// Actualizar categorías si existen
		if (isset($objeto->categorias) && is_array($objeto->categorias) && count($objeto->categorias) > 0) {
			// Eliminar categorías antiguas
			$sqlDelete = "DELETE FROM cuadro_categoria WHERE id_cuadro=$objeto->id";
			$this->enlace->executeSQL_DML($sqlDelete);

			// Insertar nuevas categorías
			foreach ($objeto->categorias as $id_categoria) {
				$sqlInsert = "INSERT INTO cuadro_categoria (id_cuadro, id_categoria) VALUES ($objeto->id, $id_categoria)";
				$this->enlace->executeSQL_DML($sqlInsert);
			}
		}

		return $this->get($objeto->id);
	}

}
