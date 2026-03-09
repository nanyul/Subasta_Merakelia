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
        
        $vSql = "SELECT c.id, c.nombre, c.nombre_artista, c.valor_estimado,
        ROUND(c.valor_estimado * 510, 2) AS valor_estimado_colones,
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
                    // Convertir array de categorías a array de descripciones
                    $cuadro->categorias = array_column($categorias ?: [], 'descripcion');
                    $cuadro->imagen = $imageM->getImageCuadro($cuadro->id);
                }
            }
        }
   
        return $vResultado;
    }

    public function get($id)
    {
        $vSql = "SELECT c.id, c.nombre, c.descripcion, c.nombre_artista, c.fecha_registro, c.valor_estimado,
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
                    // Convertir array de categorías a array de descripciones
                    $cuadro->categorias = array_column($categorias ?: [], 'descripcion');
                    $cuadro->imagen = $imageM->getImageCuadro($cuadro->id);
                    $cuadro->imagenes = $imageM->getAllImagesCuadro($cuadro->id);

                    $cuadro->subasta = $subastaM->getSubastabyCuadro($cuadro->id);
                }

            }
        }

        return $vResultado;
        
    }

}
