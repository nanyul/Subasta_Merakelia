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
    
    public function uploadFile($inputData)
    {
        // Verificar que exista el archivo
        if (!isset($_FILES['image'])) {
            return false;
        }

        $file = $_FILES['image'];
        $id_cuadro = isset($_POST['id_cuadro']) ? intval($_POST['id_cuadro']) : null;

        // Validar que haya ID de cuadro
        if (!$id_cuadro) {
            return false;
        }

        // Validar extensión del archivo
        $file_ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($file_ext, $this->valid_extensions)) {
            return false;
        }

        // Crear nombre único para el archivo
        $new_filename = uniqid('img_') . '.' . $file_ext;
        $upload_path = dirname(dirname(__DIR__)) . '/uploads/';

        // Crear carpeta si no existe
        if (!is_dir($upload_path)) {
            mkdir($upload_path, 0755, true);
        }

        // Mover archivo
        $target_file = $upload_path . $new_filename;
        if (!move_uploaded_file($file['tmp_name'], $target_file)) {
            return false;
        }

        // Guardar en base de datos
        $sql = "INSERT INTO imagen (datos, fecha_registro) VALUES ('$new_filename', NOW())";
        $id_imagen = $this->enlace->executeSQL_DML_last($sql);

        if (!$id_imagen) {
            return false;
        }

        // Asociar imagen con cuadro
        $sql_assoc = "INSERT INTO cuadro_imagen (id_cuadro, id_imagen) VALUES ($id_cuadro, $id_imagen)";
        $this->enlace->executeSQL_DML($sql_assoc);

        return array('id' => $id_imagen, 'datos' => $new_filename);
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

    public function deleteAllImagesByCuadro($idCuadro)
    {
        $idCuadro = intval($idCuadro);

        // Obtener todas las imágenes del cuadro
        $vSql = "SELECT i.id, i.datos
                FROM imagen i
                JOIN cuadro_imagen c ON c.id_cuadro = $idCuadro
                WHERE i.id = c.id_imagen;";
        $imagenes = $this->enlace->ExecuteSQL($vSql);

        // Eliminar relaciones cuadro_imagen
        $sql_delete_assoc = "DELETE FROM cuadro_imagen WHERE id_cuadro = $idCuadro;";
        $this->enlace->executeSQL_DML($sql_delete_assoc);

        // Eliminar archivos del servidor
        foreach ($imagenes as $imagen) {
            $upload_path = dirname(dirname(__DIR__)) . '/uploads/' . $imagen['datos'];
            if (file_exists($upload_path)) {
                unlink($upload_path);
            }
        }

        // Eliminar registros de imágenes (opcional, si quieres limpiar también la tabla imagen)
        // $sql_delete_images = "DELETE FROM imagen WHERE id IN (SELECT id FROM imagen WHERE id IN (" . implode(',', array_column($imagenes, 'id')) . "))";

        return true;
    }
}
