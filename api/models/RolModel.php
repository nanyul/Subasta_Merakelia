<?php
class RolModel
{
    public $enlace;
    public function __construct()
    {

        $this->enlace = new MySqlConnect();
    }
    public function all()
    {
        $vSql = "SELECT * FROM rol;";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        return $vResultado;
    }

    public function get($id)
    {
        $vSql = "SELECT * FROM rol where id=$id";

        $vResultado = $this->enlace->ExecuteSQL($vSql);

        return $vResultado[0];
    }
    public function getRolUser($idUser)
    {
        
        $vSql = "SELECT r.id, r.descripcion
            FROM rol r,usuario u 
            where r.id=u.id_rol and u.id=$idUser";

        
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        
        return $vResultado[0];
    }
}
