<?php

use Firebase\JWT\JWT;

class UserModel
{
	public $enlace;
	public function __construct()
	{
		$this->enlace = new MySqlConnect();
	}
	public function all()
	{
		//Consulta sql
		$vSql = "SELECT u.nombre, u.correo, u.id_rol
				FROM usuario u;";
		//Ejecutar la consulta
		//vResultado es un array de objetos = JSON
		$vResultado = $this->enlace->ExecuteSQL($vSql);
		if ($vResultado) { //Sino es Null
			if (is_array($vResultado) && count($vResultado) > 0) { //Si el resultado es un array y tiene elementos
				$rolM = new RolModel(); //Crear Modelo Rol
				foreach ($vResultado as $user) {
					$rol = $rolM->get($user->id_rol);
					$user->rol = $rol;
				}
			}
		}
		// Retornar el objeto
		return $vResultado;
	}

	public function get($id)
	{
		$rolM = new RolModel();
		//Consulta sql
		$vSql = "SELECT * FROM user where id=$id";
		//Ejecutar la consulta
		$vResultado = $this->enlace->ExecuteSQL($vSql);
		if ($vResultado) {
			$vResultado = $vResultado[0];
			$rol = $rolM->getRolUser($id);
			$vResultado->rol = $rol;
			// Retornar el objeto
			return $vResultado;
		} else {
			return null;
		}
	}
}
