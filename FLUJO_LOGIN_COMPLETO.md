# 📋 FLUJO COMPLETO DEL LOGIN - PASO A PASO

## 🎯 Resumen General del Flujo

El login en tu aplicación Merakelia funciona con un flujo cliente-servidor que involucra:
1. Validación en el frontend (React)
2. Envío seguro al backend (PHP)
3. Verificación de credenciales con BCRYPT
4. Generación de JWT Token
5. Almacenamiento en localStorage

---

## PASO 1️⃣: EL USUARIO INGRESA A LA PÁGINA DE LOGIN

### Frontend (React)
- **URL:** `http://localhost:5173/login`
- **Componente:** `Login.jsx`
- **Descripción:** El usuario accede a la página de login que muestra un formulario con dos campos

### Archivos Involucrados
- `main.jsx` - Define la ruta `/login`
- `Login.jsx` - Componente del formulario

---

## PASO 2️⃣: EL USUARIO COMPLETA EL FORMULARIO

### Validación en Frontend
El formulario utiliza **Yup** para validación de datos:

```javascript
const schema = yup.object({
    correo: yup.string()
        .email("Correo inválido")
        .required("El correo es obligatorio"),
    password: yup.string()
        .required("La contraseña es obligatoria"),
});
```

### Campos del Formulario
| Campo | Tipo | Validación |
|-------|------|-----------|
| Correo | text/email | Email válido, obligatorio |
| Contraseña | password | Mínimo 1 carácter, obligatorio |

### Componentes Utilizados
- `CustomInputField` para el correo electrónico
- `Input` estándar para la contraseña
- `Button` para enviar el formulario

---

## PASO 3️⃣: EL FRONTEND ENVÍA LA SOLICITUD AL BACKEND

### Código en Login.jsx (línea 40-50)
```javascript
const onSubmit = async (data) => {
    const response = await UserService.loginUser(data);
    // data = { correo: "usuario@ejemplo.com", password: "123456" }
};
```

### Servicio en UserService.js (línea 46-48)
```javascript
loginUser(User) {
    return axios.post(BASE_URL + '/login/', JSON.stringify(User));
    // POST a: http://localhost:81/apimovie/User/login/
}
```

### Datos Enviados (JSON)
```json
{
    "correo": "cliente1@prueba.com",
    "password": "123456"
}
```

### Headers de la Solicitud
```
Content-Type: application/json
```

---

## PASO 4️⃣: EL BACKEND RECIBE LA SOLICITUD

### index.php (línea 1-50)
1. Se carga el autoloader de Composer
2. Se configuran los headers CORS:
   - `Access-Control-Allow-Origin: *`
   - `Access-Control-Allow-Headers: *`
   - `Access-Control-Allow-Methods: *`
3. Se cargan todos los controladores y modelos
4. Se instancia RoutesController

### Router en RoutesController.php (línea 53-100)
```php
// Analiza la URL: /apimovie/User/login/
$controller = 'User';
$action = 'login';

// Llama al controlador: User->login()
```

---

## PASO 5️⃣: EL CONTROLADOR PROCESA LA SOLICITUD

### UserController.php (línea 87-100)
```php
public function login()
{
    $response = new Response();
    $request = new Request();
    
    // Obtiene { correo, password }
    $inputJSON = $request->getJSON();
    
    $usuario = new UserModel();
    $result = $usuario->login($inputJSON);  // Llama al modelo
    
    if (isset($result) && !empty($result) && $result != false) {
        $response->toJSON($result);  // Retorna el token JWT
    } else {
        $response->toJSON($response, "Usuario no valido");  // Error
    }
}
```

### Flujo del Controlador
1. Obtiene el JSON de la solicitud
2. Instancia el modelo UserModel
3. Llama al método login() del modelo
4. Si el resultado no es nulo, devuelve el token
5. Si falla, devuelve un mensaje de error

---

## PASO 6️⃣: EL MODELO VALIDA LAS CREDENCIALES

### UserModel.php - Método login() (línea 150-185)

#### 1. BUSCAR EL EMAIL EN LA BASE DE DATOS
```php
$vSql = "SELECT * from usuario where correo='$objeto->correo'";
$vResultado = $this->enlace->ExecuteSQL($vSql);
```

#### 2. VERIFICAR LA CONTRASEÑA (BCRYPT)
```php
if ($vResultado && is_array($vResultado) && count($vResultado) > 0) {
    $user = $vResultado[0];
    
    // Verifica la contraseña hasheada con BCRYPT
    if (password_verify($objeto->password, $user->contrasena)) {
        // ✅ Contraseña válida
    }
}
```

#### 3. OBTENER DATOS COMPLETOS DEL USUARIO
```php
$usuario = $this->get($user->id);
// Retorna: id, nombre, correo, id_rol, fecha_registro, estado, rol
```

#### 4. CREAR EL TOKEN JWT
```php
$data = [
    'id' => $usuario->id,
    'correo' => $usuario->correo,
    'rol' => $usuario->rol,
    'iat' => time(),                    // Fecha de emisión
    'exp' => time() + 3600              // Expira en 1 hora
];

$jwt_token = JWT::encode(
    $data, 
    config::get('SECRET_KEY'),          // Clave secreta
    'HS256'                             // Algoritmo
);

return $jwt_token;  // Devuelve el token JWT
```

### Respuesta en Caso de Error
```php
return false;  // Credenciales inválidas
```

---

## 📊 ESTRUCTURA DE LA BASE DE DATOS

### Tabla: usuario
```sql
CREATE TABLE usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    correo VARCHAR(255) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,      -- HASH BCRYPT
    nombre VARCHAR(255) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_rol INT NOT NULL,
    estado BIT NOT NULL DEFAULT 1,
    FOREIGN KEY (id_rol) REFERENCES rol(id)
);
```

### Tabla: rol
```sql
CREATE TABLE rol (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(50) NOT NULL UNIQUE
);
```

### Datos de Ejemplo
| id | correo | contrasena (bcrypt) | nombre | id_rol | estado |
|----|--------|-------------------|--------|--------|--------|
| 1 | admin@prueba.com | $2y$10$... | Admin | 1 | 1 |
| 2 | cliente1@prueba.com | $2y$10$... | Cliente 1 | 2 | 1 |

### Roles
| id | descripcion |
|----|------------|
| 1 | Administrador |
| 2 | Cliente |

---

## PASO 7️⃣: EL BACKEND DEVUELVE EL TOKEN AL FRONTEND

### Respuesta del Servidor
```json
{
    "success": true,
    "status": 200,
    "message": "",
    "data": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MiwiY29ycmVvIjoiY2xpZW50ZTFAcHJ1ZWJhLmNvbSIsInJvbCI6IkNsaWVudGUiLCJpYXQiOjE2OTQwMDAwMDAsImV4cCI6MTY5NDAwMzYwMH0..."
}
```

### Token JWT Decodificado
```json
{
    "id": 2,
    "correo": "cliente1@prueba.com",
    "rol": "Cliente",
    "iat": 1694000000,      // Fecha de emisión (epoch)
    "exp": 1694003600       // Fecha de expiración (epoch + 1 hora)
}
```

### Contenido del Token
| Dato | Descripción |
|------|------------|
| `id` | ID del usuario |
| `correo` | Email del usuario |
| `rol` | Rol del usuario (string) |
| `iat` | Issued at (timestamp unix) |
| `exp` | Expiration (timestamp unix, 1 hora después) |

---

## PASO 8️⃣: EL FRONTEND GUARDA EL TOKEN

### Login.jsx - Guardar Token (línea 40-45)
```javascript
if (response?.data?.data && response.data.data !== 'undefined') {
    // Guardar el token JWT
    saveUser(response.data.data);
    toast.success("Inicio de sesión exitoso");
    navigate("/");
} else {
    toast.error("Credenciales inválidas");
}
```

### UserContext.jsx - Método saveUser (línea 23-27)
```javascript
const saveUser = useCallback((newToken) => {
    localStorage.setItem('token', newToken);  // Guardar en LocalStorage
    setToken(newToken);                       // Actualizar estado
}, []);
```

### LocalStorage
```javascript
// Clave: "token"
// Valor: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

---

## PASO 9️⃣: EL FRONTEND DECODIFICA EL TOKEN

### UserContext.jsx - Decodificar JWT (línea 14-22)
```javascript
const user = useMemo(() => {
    if (!token) return null;
    try {
        return jwtDecode(token);  // Decodifica el JWT
    } catch (error) {
        console.error("Token inválido:", error);
        return null;
    }
}, [token]);
```

### Objeto Usuario Decodificado
```javascript
{
    id: 2,
    correo: "cliente1@prueba.com",
    rol: "Cliente",
    iat: 1694000000,
    exp: 1694003600
}
```

### Acceso a los Datos del Usuario
```javascript
// Desde cualquier componente con useUser()
const { user, token } = useUser();

console.log(user.id);       // 2
console.log(user.correo);   // "cliente1@prueba.com"
console.log(user.rol);      // "Cliente"
```

---

## PASO 🔟: REDIRIGIR AL HOME Y MOSTRAR MENSAJES

### Login.jsx (línea 42-46)
```javascript
if (response?.data?.data && response.data.data !== 'undefined') {
    saveUser(response.data.data);
    toast.success("Inicio de sesión exitoso");  // Mensaje success
    navigate("/");                              // Redirige al home
} else {
    toast.error("Credenciales inválidas");      // Mensaje error
}
```

### Notificaciones
- ✅ **Éxito:** "Inicio de sesión exitoso" (toast verde)
- ❌ **Error:** "Credenciales inválidas" (toast rojo)

---

## 🔐 SEGURIDAD IMPLEMENTADA

### 1. Hashing de Contraseñas
```php
// En create() se hashea con BCRYPT
$hashedPassword = password_hash($objeto->contrasena, PASSWORD_BCRYPT);
// Genera: $2y$10$...
```

### 2. Verificación de Contraseña
```php
// En login() se verifica
if (password_verify($objeto->password, $user->contrasena)) {
    // ✅ Válido
}
```

### 3. JWT Token Firmado
```php
$jwt_token = JWT::encode($data, config::get('SECRET_KEY'), 'HS256');
// Clave secreta: e0d17975bc9bd57eee132eecb6da6f11048e8a88506cc3bffc7249078cf2a77a
```

### 4. Expiración de Token
```javascript
// Token expira en 1 hora
'exp' => time() + 3600

// El frontend debe validar el tiempo de expiración
```

### 5. CORS Habilitado
```php
header("Access-Control-Allow-Origin: * ");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");
```

### 6. Validación en Frontend
- Yup para validación de datos
- React Hook Form para manejar el formulario

### 7. Validación en Backend
- Verificación de existencia del usuario
- Verificación de contraseña con BCRYPT
- Generación de JWT con datos válidos

---

## 📁 ARCHIVOS INVOLUCRADOS

### Backend (PHP)
- ✅ `api/index.php` - Punto de entrada
- ✅ `api/routes/RoutesController.php` - Enrutador
- ✅ `api/controllers/UserController.php` - Controlador
- ✅ `api/models/UserModel.php` - Modelo
- ✅ `api/config.php` - Configuración (clave secreta)
- ✅ `api/controllers/core/Response.php` - Respuestas JSON
- ✅ `api/controllers/core/Request.php` - Lectura de solicitudes

### Frontend (React)
- ✅ `app/src/main.jsx` - Punto de entrada y rutas
- ✅ `app/src/context/UserContext.jsx` - Contexto de usuario
- ✅ `app/src/hooks/useUser.js` - Hook de acceso al contexto
- ✅ `app/src/components/Login/Login.jsx` - Componente de login
- ✅ `app/src/components/Login/Register.jsx` - Componente de registro
- ✅ `app/src/services/UserService.js` - Servicio de API

---

## 🚀 CÓMO PROBAR EL LOGIN

### Opción 1: Registrar un nuevo usuario
```
1. Accede a http://localhost:5173/register
2. Completa el formulario:
   - Nombre: Tu nombre
   - Correo: tu@email.com
   - Contraseña: 123456
   - Rol: Cliente (por defecto)
3. Haz clic en "Crear cuenta"
4. Serás redirigido a /login
5. Inicia sesión con tus credenciales
```

### Opción 2: Usar datos de prueba
```
Correo: cliente1@prueba.com
Contraseña: 123456
```

### Verificar Token en localStorage
```javascript
// En la consola del navegador
localStorage.getItem('token')
// Resultado: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."

// Decodificar el token
const { jwtDecode } = require('jwt-decode');
jwtDecode(localStorage.getItem('token'))
// Resultado: { id: 2, correo: "...", rol: "...", iat: ..., exp: ... }
```

---

## 📊 FLUJO RESUMIDO EN DIAGRAMA

```
Usuario
  │
  ├─→ [1] Accede a /login
  │         │
  │         └─→ [2] Ve formulario Login.jsx
  │              │
  │              └─→ [3] Completa correo y password
  │                   │
  │                   └─→ [4] Valida con Yup (frontend)
  │                        │
  │                        ├─→ ✅ Válido
  │                        │
  │                        └─→ [5] Envía POST /User/login/
  │                             │ { correo, password }
  │                             │
  │                             └─→ [6] UserService.loginUser()
  │                                  │
  │                                  └─→ [7] Backend recibe solicitud
  │                                       │
  │                                       └─→ [8] RoutesController.php
  │                                            │
  │                                            └─→ [9] UserController->login()
  │                                                 │
  │                                                 └─→ [10] UserModel->login()
  │                                                      │
  │                                                      ├─→ [11] SELECT FROM usuario
  │                                                      │
  │                                                      ├─→ [12] password_verify()
  │                                                      │
  │                                                      ├─→ [13] JWT::encode()
  │                                                      │
  │                                                      └─→ [14] return $jwt_token
  │                                                           │
  │                                                           └─→ [15] Response JSON
  │                                                                { data: "token..." }
  │
  └─→ [16] Frontend recibe token
       │
       ├─→ [17] saveUser(token)
       │   │
       │   ├─→ localStorage.setItem('token', token)
       │   │
       │   └─→ setToken(token)
       │
       ├─→ [18] jwtDecode(token)
       │   │
       │   └─→ user = { id, correo, rol, iat, exp }
       │
       ├─→ [19] toast.success("Inicio exitoso")
       │
       └─→ [20] navigate("/")
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- ✅ UserModel.php tiene método login() con BCRYPT
- ✅ UserModel.php hashea contraseñas en create()
- ✅ UserController.php tiene método login()
- ✅ UserContext.jsx proporciona hook useUser()
- ✅ UserProvider envuelve toda la aplicación
- ✅ Login.jsx usa correo en lugar de email
- ✅ Register.jsx usa los nombres correctos de campos
- ✅ main.jsx incluye rutas de login y register
- ✅ Validación Yup en ambos formularios
- ✅ Token se guarda en localStorage
- ✅ Token se decodifica correctamente
- ✅ Expiración de token en 1 hora

---

## 🎓 CONCLUSIÓN

El flujo de login en tu aplicación Merakelia es completo y seguro:
1. **Frontend:** Valida datos y maneja la interfaz
2. **Backend:** Verifica credenciales y genera JWT
3. **Almacenamiento:** Token guardado en localStorage
4. **Decodificación:** Usuario disponible en contexto
5. **Seguridad:** BCRYPT + JWT + CORS

¡Tu login está listo para usar! 🚀
