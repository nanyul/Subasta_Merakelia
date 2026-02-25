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
        //Consulta sql
        $vSql = "SELECT c.id, c.nombre, c.nombre_artista,
        CASE c.id_estado_cuadro
            WHEN 1 THEN 'Publicado'
            WHEN 2 THEN 'Reservado'
            ELSE 'Retirado'
        END AS estado_cuadro,
        IF(c.id_estado_condicion = 1, 'Nuevo', 'Usado') AS estado_condicion
        FROM cuadro_subastable c;";

        //vResultado es un array de objetos = JSON
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        if ($vResultado) { //Sino es Null
            if (is_array($vResultado) && count($vResultado) > 0) { //Si el resultado es un array y tiene elementos
                $categoriaM = new CategoriasModel(); //Crear Modelo Categoria
                $imageM = new ImageModel(); //Crear Modelo Imagen
                foreach ($vResultado as $cuadro) {
                    $categorias = $categoriaM->getByCuadro($cuadro->id); // Usar id del cuadro
                    // Convertir array de categorías a array de descripciones
                    $cuadro->categorias = array_column($categorias ?: [], 'descripcion');

                    //para obtener la imagen en posición [0] (primera) del array resultado de getImageCuadro
                    $cuadro=$cuadro[0];
                    $cuadro->imagen = $imageM->getImageCuadro($cuadro->id);
                }
            }
        }
        // Retornar el objeto
        return $vResultado;
    }

    public function get($id)
    {
        //Consulta sql
        $vSql = "SELECT c.id, c.nombre, c.descripcion, c.nombre_artista, c.fecha_registro,
        CASE c.id_estado_cuadro
            WHEN 1 THEN 'Publicado'
            WHEN 2 THEN 'Reservado'
            ELSE 'Retirado'
        END AS estado_cuadro,
        IF(c.id_estado_condicion = 1, 'Nuevo', 'Usado') AS estado_condicion
        FROM cuadro_subastable c
        WHERE c.id = $id";

        //vResultado es un array de objetos = JSON
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        if ($vResultado) { //Sino es Null
            if (is_array($vResultado) && count($vResultado) > 0) { //Si el resultado es un array y tiene elementos
                $categoriaM = new CategoriasModel(); //Crear Modelo Categoria
                $imageM = new ImageModel(); //Crear Modelo Imagen
                $subastaM = new SubastaModel(); //Crear Modelo Subasta
                foreach ($vResultado as $cuadro) {
                    $categorias = $categoriaM->getByCuadro($cuadro->id); // Usar id del cuadro
                    // Convertir array de categorías a array de descripciones
                    $cuadro->categorias = array_column($categorias ?: [], 'descripcion');
                    $cuadro->imagen = $imageM->getImageCuadro($cuadro->id);

                    $cuadro->subasta = $subastaM->getSubastabyCuadro($cuadro->id);
                }

            }
        }

        // Retornar el objeto
        return $vResultado;
        
    }

}
