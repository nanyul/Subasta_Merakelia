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

	//MANTENIMIENTOS
	//
	public function create($objeto)
	{
		// Hash de la contraseña con BCRYPT
		$hashedPassword = password_hash($objeto->contrasena, PASSWORD_BCRYPT);
		
		$sql = "INSERT INTO usuario (correo, contrasena, nombre, fecha_registro, id_rol, estado) " .
			"VALUES ('$objeto->correo', '$hashedPassword', '$objeto->nombre', " .
			"'$objeto->fecha_registro', $objeto->id_rol, $objeto->estado)";

		$idUser = $this->enlace->executeSQL_DML_last($sql);

		return $this->get($idUser);
	}

	public function update($objeto)
	{
		$sql = "UPDATE usuario SET nombre='$objeto->nombre', correo='$objeto->correo' " .
			"WHERE id=$objeto->id";

		$this->enlace->executeSQL_DML($sql);

		return $this->get($objeto->id);
	}

	public function delete($id)
	{
		$sql = "SELECT estado, id_rol FROM usuario WHERE id=$id";

		$result = $this->enlace->ExecuteSQL($sql);

		if ($result && isset($result[0]->estado)) {
			
			// ¿Es vendedor?
			if ($result[0]->id_rol == 2) {
				// Verificar si tiene subastas asociadas
				$cantidadSubastas = $this->CantidadSubastas($id);
				if ($cantidadSubastas > 0) {
					// Usuario tiene subastas, no permitir desactivar
					return null;
				}
			}
			
			$nuevoEstado = $result[0]->estado == 1 ? 0 : 1;

			$sqlUpdate = "UPDATE usuario SET estado=$nuevoEstado WHERE id=$id";

			$this->enlace->executeSQL_DML($sqlUpdate);

			return $this->get($id);
		}

		return null;
		
	}

		public function login($objeto)
	{
		// Validar que el objeto no sea null
		if (!$objeto || !isset($objeto->correo) || !isset($objeto->contrasena)) {
			return false;
		}

		$vSql = "SELECT * from usuario where correo='$objeto->correo'";
		//Ejecutar la consulta
		$vResultado = $this->enlace->ExecuteSQL($vSql);
		
		if ($vResultado && is_array($vResultado) && count($vResultado) > 0) {
			$user = $vResultado[0];
			// Verificar la contraseña hasheada con BCRYPT
			if (password_verify($objeto->contrasena, $user->contrasena)) {
				$usuario = $this->get($user->id);
				if (!empty($usuario)) {
					// Datos para el token JWT
					$data = [
						'id' => $usuario->id,
						'nombre' => $usuario->nombre,
						'correo' => $usuario->correo,
						'rol' => $usuario->rol,
						'iat' => time(),
						'exp' => time() + 3600  // Expira en 1 hora
					];

					// Generar el token JWT
					$jwt_token = JWT::encode($data, config::get('SECRET_KEY'), 'HS256');

					// Enviar el token como respuesta
					return $jwt_token;
				}
			}
		}
		
		return false;
	}
}
