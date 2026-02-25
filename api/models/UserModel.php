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
		$vSql = "SELECT u.nombre, u.correo, u.id_rol,
			IF(u.estado = 1, 'Activo', 'Inactivo') AS estado
				FROM usuario u;";
		//Ejecutar la consulta
		//vResultado es un array de objetos = JSON
		$vResultado = $this->enlace->ExecuteSQL($vSql);
		if ($vResultado) { //Sino es Null
			if (is_array($vResultado) && count($vResultado) > 0) { //Si el resultado es un array y tiene elementos
				$rolM = new RolModel(); //Crear Modelo Rol
				foreach ($vResultado as $user) {
					$rol = $rolM->get($user->id_rol);
					$user->rol = $rol->descripcion; //Agregar el nombre del rol al objeto usuario
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
		$vSql = "SELECT u.id, u.nombre, u.correo, u.id_rol, u.fecha_registro,
			IF(u.estado = 1, 'Activo', 'Inactivo') 
			AS estado
			FROM usuario u 
			WHERE u.id=$id";
		//Ejecutar la consulta
		$vResultado = $this->enlace->ExecuteSQL($vSql);
		if ($vResultado) {
			$vResultado = $vResultado[0];
			$rol = $rolM->getRolUser($id);
			$vResultado->rol = $rol->descripcion;

		if ($vResultado->id_rol == 2) {
			$vResultado->cantidad_subastas = $this->CantidadSubastas($id);
		} elseif ($vResultado->id_rol == 1) {
			$vResultado->cantidad_pujas = $this->CantidadPujas($id);
		}

			// Retornar el objeto
			return $vResultado;
		} else {
			return null;
		}
	}

	public function CantidadSubastas($idUser)
	{
		//Consulta sql
		$vSql = "SELECT COUNT(*) AS cantidad FROM subasta WHERE id_usuario=$idUser";
		//Ejecutar la consulta
		$vResultado = $this->enlace->ExecuteSQL($vSql);
		if ($vResultado) {
			return $vResultado[0]->cantidad;
		} else {
			return 0;
		}
	}

	public function CantidadPujas($idUser)
	{
		//Consulta sql
		$vSql = "SELECT COUNT(*) AS cantidad FROM puja WHERE id_usuario=$idUser";
		//Ejecutar la consulta
		$vResultado = $this->enlace->ExecuteSQL($vSql);
		if ($vResultado) {
			return $vResultado[0]->cantidad;
		} else {
			return 0;
		}
	}


}
