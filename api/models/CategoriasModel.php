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
        
        $vSql = "SELECT * FROM categoria;";

        $vResultado = $this->enlace->ExecuteSQL($vSql);

        return $vResultado;
    }

    public function get($id)
    {
        $vSql = "SELECT * FROM categoria where id=$id";

        $vResultado = $this->enlace->ExecuteSQL($vSql);
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

    public function getCuadrobyCategorias($param)
    {
        $vResultado = null;
        if (!empty($param)) {
            $vSql = "SELECT c.id, c.descripcion
				FROM cuadro_subastable c, cuadro_categoria s
				where c.id=s.id_cuadro and s.id_categoria = $param";
            $vResultado = $this->enlace->ExecuteSQL($vSql);
        }

        return $vResultado;
    }
}
