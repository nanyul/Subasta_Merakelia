<?php
class ImageModel
{
    private $upload_path = 'uploads/';
    private $valid_extensions = array('jpeg', 'jpg', 'png', 'gif');

    public $enlace;
    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }
    //Subir imagen de una pelicula registrada
    public function uploadFile($object)
    {
        return false;
    }
    //Obtener una imagen de una pelicula
    public function getImageCuadro($idMovie)
    {
        //Consulta sql
        $vSql = "SELECT i.id, i.datos, i.fecha_registro
                FROM imagen i
                JOIN cuadro_imagen c ON c.id_cuadro = $idMovie
                where i.id = c.id_imagen;";

        //Ejecutar la consulta
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        if (!empty($vResultado)) {
            // Retornar el objeto en posición [0]
            return $vResultado[0];
        }
        return $vResultado;
    }
}
