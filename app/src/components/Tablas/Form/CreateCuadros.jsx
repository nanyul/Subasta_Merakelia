import { useEffect, useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// shadcn/ui
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

// icons
import { Save, ArrowLeft, X, ShieldCheck, UserRound } from "lucide-react";

// servicios
import CuadrosService from "../../../services/CuadrosService";
import CategoriasService from "../../../services/CategoriasService";
import ImageService from "../../../services/ImageService";
import { useUser } from "@/hooks/useUser";

// componentes reutilizables
import { CustomInputField } from "../../ui/custom/custom-input-field";
import { CustomSelect } from "../../ui/custom/custom-select";
import fondoTabla from "@/assets/fondoTabla.png";

const CONDICIONES = [
    { id: 1, descripcion: "Nuevo" },
    { id: 2, descripcion: "Usado" },
];



const extractArrayFromResponse = (response) => {
    const payload = response?.data;

    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.result)) return payload.result;

    if (payload && typeof payload === "object") {
        const firstArray = Object.values(payload).find(Array.isArray);
        return Array.isArray(firstArray) ? firstArray : [];
    }

    return [];
};

export function CreateCuadros() {
    const { user: authUser } = useUser();
    const navigate = useNavigate();

    /*** Estados ***/
    const [dataCategorias, setDataCategorias] = useState([]);
    const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([]);
    const [imagenesSeleccionadas, setImagenesSeleccionadas] = useState([]);
    const [imagenesPreview, setImagenesPreview] = useState([]);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const categoriasDisponibles = useMemo(() => {
        return dataCategorias.filter((cat) => cat && cat.id && cat.descripcion);
    }, [dataCategorias]);

    /*** Esquema de validación Yup ***/
    const cuadroSchema = yup.object({
        nombre: yup
            .string()
            .required("El nombre del cuadro es requerido"),
        descripcion: yup
            .string()
            .required("La descripción es requerida")
            .min(20, "La descripción debe tener al menos 20 caracteres"),
        id_estado_condicion: yup
            .number()
            .required("Seleccione una condición"),
        nombre_artista: yup.string(),
        valor_estimado: yup.number(),
        ano_creacion: yup
            .number()
            .nullable()
            .typeError("El año debe ser un número")
            .min(1901, "El año debe ser mayor o igual a 1901")
            .max(2155, "El año debe ser menor o igual a 2155"),
        tecnica: yup.string(),
        dimensiones: yup.string(),
        material_soporte: yup.string(),
        procedencia: yup.string(),
        certificado_autenticidad: yup.boolean(),
    });

    /*** React Hook Form ***/
    const { control, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            nombre: "",
            descripcion: "",
            nombre_artista: "",
            valor_estimado: "",
            id_estado_condicion: "",
            ano_creacion: "",
            tecnica: "",
            dimensiones: "",
            material_soporte: "",
            procedencia: "",
            certificado_autenticidad: false,
        },
        resolver: yupResolver(cuadroSchema),
    });

    /*** Cargar categorías ***/
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoadingData(true);

                // Cargar categorías
                try {
                    const categoriasRes = await CategoriasService.getCategorias();
                    setDataCategorias(extractArrayFromResponse(categoriasRes));
                } catch (err) {
                    console.error("Error al cargar categorías:", err);
                    setDataCategorias([]);
                }

                setError("");
            } catch (err) {
                if (err.name !== "AbortError") {
                    console.error("Error al cargar datos:", err);
                }
            } finally {
                setIsLoadingData(false);
            }
        };
        fetchData();
    }, []);

    /*** Manejo de selección de categorías ***/
    const handleCategoriaToggle = (categoriaId) => {
        setCategoriasSeleccionadas((prev) =>
            prev.includes(categoriaId)
                ? prev.filter((id) => id !== categoriaId)
                : [...prev, categoriaId]
        );
    };

    /*** Manejo de carga de imágenes ***/
    const handleImagenesChange = (e) => {
        const files = Array.from(e.target.files || []);

        if (imagenesSeleccionadas.length + files.length > 5) {
            toast.error("Máximo 5 imágenes permitidas", { duration: 2000 });
            return;
        }

        const nuevasImagenes = [...imagenesSeleccionadas, ...files];
        setImagenesSeleccionadas(nuevasImagenes);

        // Crear previews
        files.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagenesPreview((prev) => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    /*** Remover imagen ***/
    const removerImagen = (index) => {
        setImagenesSeleccionadas((prev) => prev.filter((_, i) => i !== index));
        setImagenesPreview((prev) => prev.filter((_, i) => i !== index));
    };

    /*** Submit - crear cuadro ***/
    const onSubmit = async (dataForm) => {
        // Validar categorías
        if (categoriasSeleccionadas.length === 0) {
            toast.error("Debe seleccionar al menos una categoría", { duration: 2000 });
            return;
        }

        // Validar imágenes
        if (imagenesSeleccionadas.length === 0) {
            toast.error("Debe subir al menos una imagen", { duration: 2000 });
            return;
        }

        try {
            setIsSubmitting(true);

            // Crear objeto cuadro
            const cuadroPayload = {
                nombre: dataForm.nombre.trim(),
                descripcion: dataForm.descripcion.trim(),
                nombre_artista: dataForm.nombre_artista.trim(),
                valor_estimado: parseFloat(dataForm.valor_estimado),
                id_estado_condicion: Number(dataForm.id_estado_condicion),
                ano_creacion: dataForm.ano_creacion ? Number(dataForm.ano_creacion) : null,
                tecnica: dataForm.tecnica?.trim() || "",
                dimensiones: dataForm.dimensiones?.trim() || "",
                material_soporte: dataForm.material_soporte?.trim() || "",
                procedencia: dataForm.procedencia?.trim() || "",
                certificado_autenticidad: dataForm.certificado_autenticidad ? 1 : 0,
                id_estado_cuadro: 1, // Estado activo por defecto
                id_usuario: authUser.id,
                categorias: categoriasSeleccionadas,
            };

            // Crear cuadro
            const cuadroResponse = await CuadrosService.createCuadro(cuadroPayload);
            
            // Extraer el cuadro creado de la respuesta (puede ser array o tener estructura data)
            const cuadrosArray = extractArrayFromResponse(cuadroResponse);
            
            if (!cuadrosArray || cuadrosArray.length === 0) {
                throw new Error(cuadroResponse.data?.message || "Error al crear el cuadro");
            }

            const cuadroCreado = cuadrosArray[0];

            // Subir imágenes
            for (const archivo of imagenesSeleccionadas) {
                const formData = new FormData();
                formData.append("image", archivo);
                formData.append("id_cuadro", cuadroCreado.id);
                await ImageService.createImage(formData);
            }

            toast.success("Cuadro creado correctamente", { duration: 3000 });
            navigate("/CuadrosSubastables");
        } catch (err) {
            console.error(err);
            setError(err.message || "Error al crear el cuadro");
            toast.error(err.message || "Error al crear el cuadro", { duration: 3000 });
        } finally {
            setIsSubmitting(false);
        }
    };

    const sinCategoriasDisponibles = !isLoadingData && categoriasDisponibles.length === 0;

    return (
        <div
            className="min-h-screen bg-[#171741] px-4 pb-8 pt-14 sm:pt-16"
            style={{
                backgroundImage: `linear-gradient(rgba(10,18,44,0.25), rgba(10,18,44,0.45)), url(${fondoTabla})`,
                backgroundSize: "cover",
                backgroundPosition: "center top",
                backgroundRepeat: "no-repeat",
            }}
        >
            <Card className="mx-auto w-full max-w-4xl border-[#ECB44D] bg-[#171741]/90 p-6 shadow-[0_12px_45px_rgba(11,18,44,0.4)]">
                <h2
                    className="mb-1 text-4xl text-[#F2E199] drop-shadow-[0_0_10px_rgba(242,225,153,0.6)]"
                    style={{ fontFamily: '"Great Vibes", cursive' }}
                >
                    Crear Cuadro
                </h2>

                {error && (
                    <div className="mb-4 rounded-md border border-[#ECB44D]/50 bg-[#ECB44D]/10 px-4 py-3 text-sm" style={{ color: '#ECB44D' }}>
                        {error}
                    </div>
                )}

                {sinCategoriasDisponibles && (
                    <div className="mb-4 rounded-md border border-amber-300/60 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
                        No hay categorías disponibles en este momento.
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" autoComplete="off">

                    {/* Usuario vendedor (no editable) */}
                    <div className="rounded-lg border border-[#6FB8E6]/45 bg-[#194174]/35 px-4 py-3">
                        <Label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#BEE7FF]">
                            <UserRound className="h-4 w-4" />
                            Usuario vendedor asignado
                        </Label>
                        {authUser ? (
                            <>
                                <p className="text-sm font-semibold text-white">{authUser.nombre || authUser.name || "Nombre no disponible"}</p>
                                <p className="text-xs text-[#6FB8E6]">{authUser.correo || authUser.email || "Email no disponible"}</p>
                            </>
                        ) : (
                            <p className="text-sm text-orange-300">Usuario no autenticado</p>
                        )}
                        <p className="mt-2 flex items-center gap-2 text-xs text-[#F2E199]">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Tu usuario como vendedor, campo no editable.
                        </p>
                    </div>

                    {/* Nombre */}
                    <div>
                        <Controller
                            name="nombre"
                            control={control}
                            render={({ field }) => (
                                <CustomInputField
                                    {...field}
                                    label="Nombre del cuadro"
                                    type="text"
                                    placeholder="Ej: Paisaje Nocturno"
                                    error={errors.nombre?.message}
                                />
                            )}
                        />
                    </div>

                    {/* Descripción */}
                    <div>
                        <Controller
                            name="descripcion"
                            control={control}
                            render={({ field }) => (
                                <div>
                                    <Label className="mb-1 block text-sm font-medium text-[#F2E199]">Descripción</Label>
                                    <textarea
                                        {...field}
                                        placeholder="Describe el cuadro con detalle (mínimo 20 caracteres)..."
                                        rows="4"
                                        className="w-full rounded-md border border-[#6FB8E6]/30 bg-[#194174]/20 px-3 py-2 text-[#F2E199] placeholder-[#6FB8E6]/40 focus:outline-none focus:ring-2 focus:ring-[#ECB44D]"
                                    />
                                    {errors.descripcion && (
                                        <p className="mt-1 text-xs text-[#ECB44D]">{errors.descripcion.message}</p>
                                    )}
                                </div>
                            )}
                        />
                    </div>

                    {/* Nombre Artista */}
                    <div>
                        <Controller
                            name="nombre_artista"
                            control={control}
                            render={({ field }) => (
                                <CustomInputField
                                    {...field}
                                    label="Nombre del artista"
                                    type="text"
                                    placeholder="Ej: Pablo Picasso"
                                    error={errors.nombre_artista?.message}
                                />
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Valor Estimado */}
                        <div>
                            <Controller
                                name="valor_estimado"
                                control={control}
                                render={({ field }) => (
                                    <CustomInputField
                                        {...field}
                                        label="Valor estimado (USD)"
                                        type="number"
                                        placeholder="0.00"
                                        step="0.01"
                                        error={errors.valor_estimado?.message}
                                    />
                                )}
                            />
                        </div>

                        {/* Condición */}
                        <div>
                            <Label className="mb-1 block text-sm font-medium text-[#F2E199]">Condición</Label>
                            <Controller
                                name="id_estado_condicion"
                                control={control}
                                render={({ field }) => (
                                    <CustomSelect
                                        field={field}
                                        data={CONDICIONES}
                                        label="Condición"
                                        getOptionLabel={(cond) => cond.descripcion}
                                        getOptionValue={(cond) => cond.id}
                                        error={errors.id_estado_condicion?.message}
                                    />
                                )}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Año de Creación */}
                        <div>
                            <Controller
                                name="ano_creacion"
                                control={control}
                                render={({ field }) => (
                                    <CustomInputField
                                        {...field}
                                        label="Año de creación"
                                        type="number"
                                        placeholder="1901 a 2155"
                                        min="1901"
                                        max="2155"
                                        error={errors.ano_creacion?.message}
                                    />
                                )}
                            />
                        </div>

                        {/* Técnica */}
                        <div>
                            <Controller
                                name="tecnica"
                                control={control}
                                render={({ field }) => (
                                    <CustomInputField
                                        {...field}
                                        label="Técnica"
                                        type="text"
                                        placeholder="Ej: Óleo sobre lienzo"
                                        error={errors.tecnica?.message}
                                    />
                                )}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Dimensiones */}
                        <div>
                            <Controller
                                name="dimensiones"
                                control={control}
                                render={({ field }) => (
                                    <CustomInputField
                                        {...field}
                                        label="Dimensiones"
                                        type="text"
                                        placeholder="Ej: 100x80 cm"
                                        error={errors.dimensiones?.message}
                                    />
                                )}
                            />
                        </div>

                        {/* Material/Soporte */}
                        <div>
                            <Controller
                                name="material_soporte"
                                control={control}
                                render={({ field }) => (
                                    <CustomInputField
                                        {...field}
                                        label="Material/Soporte"
                                        type="text"
                                        placeholder="Ej: Lienzo"
                                        error={errors.material_soporte?.message}
                                    />
                                )}
                            />
                        </div>
                    </div>

                    {/* Procedencia */}
                    <div>
                        <Controller
                            name="procedencia"
                            control={control}
                            render={({ field }) => (
                                <div>
                                    <Label className="mb-1 block text-sm font-medium text-[#F2E199]">Procedencia (opcional)</Label>
                                    <textarea
                                        {...field}
                                        placeholder="Información sobre el origen y procedencia del cuadro..."
                                        rows="3"
                                        className="w-full rounded-md border border-[#6FB8E6]/30 bg-[#194174]/20 px-3 py-2 text-[#F2E199] placeholder-[#6FB8E6]/40 focus:outline-none focus:ring-2 focus:ring-[#ECB44D]"
                                    />
                                    {errors.procedencia && (
                                        <p className="mt-1 text-xs text-[#ECB44D]">{errors.procedencia.message}</p>
                                    )}
                                </div>
                            )}
                        />
                    </div>

                    {/* Certificado de Autenticidad */}
                    <div className="flex items-center gap-3 rounded-md border border-[#6FB8E6]/20 bg-[#194174]/10 p-4">
                        <Controller
                            name="certificado_autenticidad"
                            control={control}
                            render={({ field }) => (
                                <input
                                    type="checkbox"
                                    checked={field.value}
                                    onChange={(e) => field.onChange(e.target.checked)}
                                    className="h-4 w-4 rounded border-[#6FB8E6] bg-[#194174] cursor-pointer"
                                />
                            )}
                        />
                        <Label className="text-sm text-[#F2E199] cursor-pointer">Posee certificado de autenticidad</Label>
                    </div>

                    {/* Categorías */}
                    <div>
                        <Label className="mb-3 block text-sm font-medium text-[#F2E199]">
                            Categorías <span className="text-[#ECB44D]">*</span>
                        </Label>
                        {categoriasDisponibles.length > 0 ? (
                            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                {categoriasDisponibles.map((categoria) => (
                                    <div key={categoria.id} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id={`categoria-${categoria.id}`}
                                            checked={categoriasSeleccionadas.includes(categoria.id)}
                                            onChange={() => handleCategoriaToggle(categoria.id)}
                                            className="h-4 w-4 rounded border-[#6FB8E6] bg-[#194174] cursor-pointer"
                                        />
                                        <Label htmlFor={`categoria-${categoria.id}`} className="text-sm text-[#F2E199] cursor-pointer">
                                            {categoria.descripcion}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-[#6FB8E6]">Cargando categorías...</p>
                        )}
                        {categoriasSeleccionadas.length === 0 && (
                            <p className="mt-2 text-xs text-[#ECB44D]">Debe seleccionar al menos una categoría</p>
                        )}
                        <p className="mt-2 text-xs text-[#6FB8E6]">
                            Seleccionadas: {categoriasSeleccionadas.length}
                        </p>
                    </div>

                    {/* Imágenes */}
                    <div>
                        <Label className="mb-3 block text-sm font-medium text-[#F2E199]">
                            Imágenes <span className="text-[#ECB44D]">*</span>
                        </Label>
                        <div className="rounded-md border-2 border-dashed border-[#6FB8E6]/40 bg-[#194174]/10 p-6">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImagenesChange}
                                disabled={imagenesSeleccionadas.length >= 5}
                                className="hidden"
                                id="imagenes-input"
                            />
                            <label
                                htmlFor="imagenes-input"
                                className="cursor-pointer text-center"
                            >
                                <p className="text-sm text-[#F2E199]">
                                    Sube imágenes del cuadro (máximo 5)
                                </p>
                                <p className="mt-1 text-xs text-[#6FB8E6]">
                                    Soporta: JPG, PNG, GIF, WebP
                                </p>
                            </label>
                        </div>

                        {/* Vista previa */}
                        {imagenesPreview.length > 0 && (
                            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                                {imagenesPreview.map((preview, index) => (
                                    <div key={index} className="relative">
                                        <img
                                            src={preview}
                                            alt={`Preview ${index + 1}`}
                                            className="h-24 w-full rounded-md border border-[#6FB8E6]/30 object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removerImagen(index)}
                                            className="absolute -right-2 -top-2 rounded-full bg-[#ECB44D] p-1 hover:bg-[#ECB44D]/80"
                                        >
                                            <X className="h-4 w-4 text-[#171741]" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <p className="mt-2 text-xs text-[#6FB8E6]">
                            Imágenes cargadas: {imagenesSeleccionadas.length}/5
                        </p>
                        {imagenesSeleccionadas.length === 0 && (
                            <p className="mt-2 text-xs text-[#ECB44D]">Debe subir al menos una imagen</p>
                        )}
                    </div>

                    {/* Estado */}
                    <div className="rounded-md border border-[#6FB8E6]/30 bg-[#194174]/20 p-4">
                        <Label className="block text-sm font-medium text-[#F2E199]">Estado inicial</Label>
                        <p className="mt-2 text-sm text-[#6FB8E6]">✓ Activo</p>
                        <p className="text-xs text-[#6FB8E6]">El cuadro será publicado en estado activo</p>
                    </div>

                    {/* Botones */}
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex items-center gap-2 border-[#6FB8E6] bg-[#171741] text-[#F2E199] hover:bg-[#194174]"
                            onClick={() => navigate(-1)}
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Regresar
                        </Button>
                        <Button
                            type="submit"
                            className="flex items-center gap-2 bg-[#ECB44D] text-[#171741] hover:bg-[#ECB44D]/80"
                            disabled={isLoadingData || isSubmitting || sinCategoriasDisponibles}
                        >
                            <Save className="h-4 w-4" />
                            {isSubmitting ? "Guardando..." : "Crear cuadro"}
                        </Button>
                    </div>

                </form>
            </Card>
        </div>
    );
}
