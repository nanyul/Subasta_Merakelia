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
		
		$vSql = "SELECT u.nombre, u.correo, u.id_rol, u.id,
			IF(u.estado = 1, 'Activo', 'Inactivo') AS estado
				FROM usuario u;";

		//vResultado es un array de objetos = JSON
		$vResultado = $this->enlace->ExecuteSQL($vSql);
		if ($vResultado) { //Sino es Null
			if (is_array($vResultado) && count($vResultado) > 0) { 
				$rolM = new RolModel(); 
				foreach ($vResultado as $user) {
					$rol = $rolM->get($user->id_rol);
					$user->rol = $rol->descripcion; 
				}
			}
		}

		return $vResultado;
	}

	public function get($id)
	{
		$rolM = new RolModel();

		$vSql = "SELECT u.id, u.nombre, u.correo, u.id_rol, u.fecha_registro,
			IF(u.estado = 1, 'Activo', 'Inactivo') 
			AS estado
			FROM usuario u 
			WHERE u.id=$id";

		$vResultado = $this->enlace->ExecuteSQL($vSql);
		if ($vResultado) {
			$vNResultado = $vResultado[0];
			$rol = $rolM->getRolUser($id);
			$vNResultado->rol = $rol->descripcion;

			if ($vNResultado->id_rol == 2) {
				$vNResultado->cantidad_subastas = $this->CantidadSubastas($id);
			} elseif ($vNResultado->id_rol == 1) {
				$vNResultado->cantidad_pujas = $this->CantidadPujas($id);
			}

			return $vNResultado;
		} else {
			return null;
		}
	}

	public function CantidadSubastas($idUser)
	{

		$vSql = "SELECT COUNT(*) AS cantidad FROM subasta WHERE id_usuario=$idUser";

		$vResultado = $this->enlace->ExecuteSQL($vSql);
		if ($vResultado) {
			return $vResultado[0]->cantidad;
		} else {
			return 0;
		}
	}

	public function CantidadPujas($idUser)
	{

		$vSql = "SELECT COUNT(*) AS cantidad FROM puja WHERE id_usuario=$idUser";
		
		$vResultado = $this->enlace->ExecuteSQL($vSql);
		if ($vResultado) {
			return $vResultado[0]->cantidad;
		} else {
			return 0;
		}
	}
}
