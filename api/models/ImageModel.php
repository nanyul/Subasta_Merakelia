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
    
    public function uploadFile($object)
    {
        return false;
    }
    
    public function getImageCuadro($idCuadro)
    {
        
        $vSql = "SELECT i.id, i.datos, i.fecha_registro
                FROM imagen i
                JOIN cuadro_imagen c ON c.id_cuadro = $idCuadro
            WHERE i.id = c.id_imagen
            ORDER BY c.id_imagen ASC
            LIMIT 1;";

        
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        if (!empty($vResultado)) {
            // Retornar el objeto en posición [0]
            return $vResultado[0];
        }
        return $vResultado;
    }

   
    public function getAllImagesCuadro($idCuadro)
    {
        $idCuadro = intval($idCuadro);
        $vSql = "SELECT i.id, i.datos, i.fecha_registro
                FROM imagen i
                JOIN cuadro_imagen c ON c.id_cuadro = $idCuadro
                WHERE i.id = c.id_imagen
                ORDER BY c.id_imagen ASC;";

        $vResultado = $this->enlace->ExecuteSQL($vSql);
        return !empty($vResultado) ? $vResultado : [];
    }
}
