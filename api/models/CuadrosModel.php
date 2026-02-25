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
        //Ejecutar la consulta
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
                    $cuadro->imagen = $imageM->getImageMovie($cuadro->id);
                }
            }
        }
        // Retornar el objeto
        return $vResultado;
    }

    public function get($id)
    {
        //Consulta sql
        $vSql = "SELECT * FROM cuadro_subastable where id=$id";

        //Ejecutar la consulta
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        // Retornar el objeto
        return $vResultado[0];
    }

}
