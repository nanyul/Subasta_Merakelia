<?php
class CategoriasModel
{
    public $enlace;
    public function __construct()
    {

        $this->enlace = new MySqlConnect();
    }
    public function all()
    {
        //Consulta sql
        $vSql = "SELECT * FROM categoria;";

        //Ejecutar la consulta
        $vResultado = $this->enlace->ExecuteSQL($vSql);

        // Retornar el objeto
        return $vResultado;
    }

    public function get($id)
    {
        //Consulta sql
        $vSql = "SELECT * FROM categoria where id=$id";

        //Ejecutar la consulta
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        // Retornar el objeto
        return $vResultado[0];
    }
        public function getByCuadro($id_cuadro)
        {
            $vSql = "SELECT c.id, c.descripcion
            FROM categoria c, cuadro_categoria s
            where c.id=s.id_categoria and s.id_cuadro = $id_cuadro";
            $vResultado = $this->enlace->ExecuteSQL($vSql);
            return $vResultado; 
        }
}
