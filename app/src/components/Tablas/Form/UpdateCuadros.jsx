import { useEffect, useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

// shadcn/ui
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

// icons
import { Save, ArrowLeft, ShieldCheck, UserRound, X } from "lucide-react";

// servicios
import CuadrosService from "../../../services/CuadrosService";
import CategoriasService from "../../../services/CategoriasService";
import ImageService from "../../../services/ImageService";

// componentes reutilizables
import { CustomInputField } from "../../ui/custom/custom-input-field";
import { CustomSelect } from "../../ui/custom/custom-select";
import { getImageUrl } from "../../../lib/imageUtils";
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

export function UpdateCuadros() {
    const navigate = useNavigate();
    const { id } = useParams();

    /*** Estados ***/
    const [cuadroData, setCuadroData] = useState(null);
    const [dataCategorias, setDataCategorias] = useState([]);
    const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([]);
    const [imagenesActuales, setImagenesActuales] = useState([]);
    const [imagenesSeleccionadas, setImagenesSeleccionadas] = useState([]);
    const [imagenesPreview, setImagenesPreview] = useState([]);
    const [imagenesAEliminar, setImagenesAEliminar] = useState([]);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [canEdit, setCanEdit] = useState(false);

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
    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
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

    /*** Cargar datos del cuadro y categorías ***/
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoadingData(true);

                // Cargar categorías disponibles PRIMERO
                let categoriasDisp = [];
                try {
                    const categoriasRes = await CategoriasService.getCategorias();
                    categoriasDisp = extractArrayFromResponse(categoriasRes);
                    setDataCategorias(categoriasDisp);
                } catch (err) {
                    console.error("Error al cargar categorías:", err);
                    setDataCategorias([]);
                }

                // Cargar cuadro
                const cuadroRes = await CuadrosService.getCuadroById(id);
                const cuadrosArray = extractArrayFromResponse(cuadroRes);
                
                if (!cuadrosArray || cuadrosArray.length === 0) {
                    setError("Cuadro no encontrado");
                    return;
                }

                const cuadro = cuadrosArray[0];
                setCuadroData(cuadro);

                // Verificar si puede editarse: NO debe estar en subasta activa
                let puedeEditar = true;
                if (cuadro.subasta && Array.isArray(cuadro.subasta) && cuadro.subasta.length > 0) {
                    const tieneSubastaActiva = cuadro.subasta.some(
                        (s) => s.estado_subasta && s.estado_subasta.toLowerCase() === "activa"
                    );
                    if (tieneSubastaActiva) {
                        puedeEditar = false;
                        setError("Este cuadro está en una subasta activa y no puede ser editado");
                    }
                }
                setCanEdit(puedeEditar);

                // Rellenar el formulario con los datos
                reset({
                    nombre: cuadro.nombre || "",
                    descripcion: cuadro.descripcion || "",
                    nombre_artista: cuadro.nombre_artista || "",
                    valor_estimado: cuadro.valor_estimado || "",
                    id_estado_condicion: cuadro.id_estado_condicion ? Number(cuadro.id_estado_condicion) : "",
                    ano_creacion: cuadro.ano_creacion || "",
                    tecnica: cuadro.tecnica || "",
                    dimensiones: cuadro.dimensiones || "",
                    material_soporte: cuadro.material_soporte || "",
                    procedencia: cuadro.procedencia || "",
                    certificado_autenticidad: cuadro.certificado_autenticidad == 1,
                });

                // Establecer categorías seleccionadas
                if (cuadro.categorias && Array.isArray(cuadro.categorias) && cuadro.categorias.length > 0) {
                    const categoriasIds = cuadro.categorias
                        .map((cat) => {
                            // Si viene como objeto con id
                            if (typeof cat === "object" && cat && cat.id) {
                                return Number(cat.id);
                            }
                            return null;
                        })
                        .filter(id => id !== null);
                    
                    setCategoriasSeleccionadas(categoriasIds);
                } else {
                    setCategoriasSeleccionadas([]);
                }

                // Cargar imágenes actuales del cuadro
                if (cuadro.imagenes && Array.isArray(cuadro.imagenes)) {
                    console.log("Imágenes cargadas:", cuadro.imagenes);
                    setImagenesActuales(cuadro.imagenes);
                } else {
                    console.log("No hay imágenes o no es array:", cuadro.imagenes);
                    setImagenesActuales([]);
                }
            } catch (err) {
                if (err.name !== "AbortError") {
                    console.error("Error al cargar datos:", err);
                    setError("Error al cargar los datos del cuadro");
                }
            } finally {
                setIsLoadingData(false);
            }
        };
        fetchData();
    }, [id, reset]);

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

        if (imagenesSeleccionadas.length + imagenesActuales.length - imagenesAEliminar.length + files.length > 5) {
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

    /*** Remover imagen actual ***/
    const removerImagenActual = (imagenId) => {
        setImagenesAEliminar((prev) => [...prev, imagenId]);
        setImagenesActuales((prev) => prev.filter((img) => img.id !== imagenId));
    };

    /*** Remover imagen nueva ***/
    const removerImagenNueva = (index) => {
        setImagenesSeleccionadas((prev) => prev.filter((_, i) => i !== index));
        setImagenesPreview((prev) => prev.filter((_, i) => i !== index));
    };

    /*** Submit - actualizar cuadro ***/
    const onSubmit = async (dataForm) => {
        if (categoriasSeleccionadas.length === 0) {
            toast.error("Debe seleccionar al menos una categoría", { duration: 2000 });
            return;
        }

        try {
            setIsSubmitting(true);

            const cuadroPayload = {
                id: Number(id),
                nombre: dataForm.nombre.trim(),
                descripcion: dataForm.descripcion.trim(),
                nombre_artista: dataForm.nombre_artista?.trim() || "",
                valor_estimado: parseFloat(dataForm.valor_estimado) || 0,
                id_estado_condicion: Number(dataForm.id_estado_condicion),
                ano_creacion: dataForm.ano_creacion ? Number(dataForm.ano_creacion) : null,
                tecnica: dataForm.tecnica?.trim() || "",
                dimensiones: dataForm.dimensiones?.trim() || "",
                material_soporte: dataForm.material_soporte?.trim() || "",
                procedencia: dataForm.procedencia?.trim() || "",
                certificado_autenticidad: dataForm.certificado_autenticidad ? 1 : 0,
                id_estado_cuadro: cuadroData.id_estado_cuadro,
                id_usuario: cuadroData.id_usuario,
                categorias: categoriasSeleccionadas,
            };

            const response = await CuadrosService.updateCuadro(cuadroPayload);

            if (response.data?.success || response.data?.data) {
                // Eliminar TODAS las imágenes anteriores del cuadro
                try {
                    await ImageService.deleteAllByCuadro(id);
                    console.log("Todas las imágenes anteriores fueron eliminadas");
                } catch (err) {
                    console.error("Error al eliminar imágenes anteriores:", err);
                }

                // Subir TODAS las nuevas imágenes (incluyendo las que se querían mantener)
                const totalImagenesNuevas = imagenesSeleccionadas.length + imagenesActuales.length - imagenesAEliminar.length;
                
                for (const archivo of imagenesSeleccionadas) {
                    const formData = new FormData();
                    formData.append("image", archivo);
                    formData.append("id_cuadro", id);
                    try {
                        await ImageService.createImage(formData);
                    } catch (err) {
                        console.error("Error al subir imagen:", err);
                    }
                }

                toast.success("Cuadro actualizado correctamente", { duration: 3000 });
                navigate("/CuadrosSubastables");
            } else if (response.data?.error) {
                setError(response.data.error);
                toast.error(response.data.error, { duration: 3000 });
            } else {
                setError("Error al actualizar el cuadro");
                toast.error("Error al actualizar el cuadro", { duration: 3000 });
            }
        } catch (err) {
            console.error(err);
            const errorMsg = err.response?.data?.error || err.message || "Error al actualizar el cuadro";
            setError(errorMsg);
            toast.error(errorMsg, { duration: 3000 });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoadingData) {
        return (
            <div className="min-h-screen bg-[#171741] flex items-center justify-center">
                <div className="text-[#F2E199]">Cargando datos...</div>
            </div>
        );
    }

    if (!cuadroData) {
        return (
            <div className="min-h-screen bg-[#171741] flex items-center justify-center">
                <div className="text-[#ECB44D]">Cuadro no encontrado</div>
            </div>
        );
    }

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
                    Editar Cuadro
                </h2>
                <p className="mb-6 text-sm text-[#6FB8E6]">
                    {cuadroData.nombre}
                </p>

                {/* Casilla informativa */}
                {cuadroData && (
                    <div className="mb-6 rounded-lg border border-[#6FB8E6]/45 bg-[#194174]/35 px-4 py-3">
                        <Label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#BEE7FF]">
                            <UserRound className="h-4 w-4" />
                            Detalles del cuadro
                        </Label>
                        <p className="text-xs uppercase tracking-wide text-[#d6d9f6]">Nombre</p>
                        <p className="text-sm font-semibold text-white">{cuadroData.nombre || "Sin información"}</p>

                        {cuadroData.nombre_dueno && (
                            <>
                                <p className="mt-2 text-xs uppercase tracking-wide text-[#d6d9f6]">Propietario</p>
                                <p className="text-sm font-semibold text-white">{cuadroData.nombre_dueno}</p>
                            </>
                        )}

                        <p className="mt-2 flex items-center gap-2 text-xs text-[#F2E199]">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Solo editable si no está en una subasta activa.
                        </p>
                    </div>
                )}

                {!canEdit && (
                    <div className="mb-4 rounded-md border border-amber-300/60 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
                        Este cuadro no puede editarse: está en una subasta activa.
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                                    placeholder="Nombre de la obra"
                                    error={errors.nombre?.message}
                                    disabled={!canEdit || isLoadingData || isSubmitting}
                                />
                            )}
                        />
                    </div>

                    {/* Descripción */}
                    <div>
                        <Label className="mb-2 block text-sm font-medium text-[#F2E199]">
                            Descripción
                        </Label>
                        <Controller
                            name="descripcion"
                            control={control}
                            render={({ field }) => (
                                <textarea
                                    {...field}
                                    disabled={!canEdit || isLoadingData || isSubmitting}
                                    className="w-full rounded-xl border border-[#6FB8E6] bg-[#194174]/40 px-4 py-3 text-[#F2E199] placeholder-[#6FB8E6]/50 focus:border-[#ECB44D] focus:outline-none focus:ring-1 focus:ring-[#ECB44D] disabled:opacity-50 disabled:cursor-not-allowed"
                                    placeholder="Descripción detallada de la obra"
                                    rows="4"
                                />
                            )}
                        />
                        {errors.descripcion && (
                            <p className="mt-1 text-sm text-red-400">{errors.descripcion.message}</p>
                        )}
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
                                    placeholder="Artista"
                                    error={errors.nombre_artista?.message}
                                    disabled={!canEdit || isLoadingData || isSubmitting}
                                />
                            )}
                        />
                    </div>

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
                                    disabled={!canEdit || isLoadingData || isSubmitting}
                                />
                            )}
                        />
                    </div>

                    {/* Condición */}
                    <div>
                        <Label className="mb-2 block text-sm font-medium text-[#F2E199]">
                            Condición
                        </Label>
                        <Controller
                            name="id_estado_condicion"
                            control={control}
                            render={({ field }) => (
                                <div style={{ opacity: !canEdit || isLoadingData || isSubmitting ? 0.5 : 1, pointerEvents: !canEdit || isLoadingData || isSubmitting ? 'none' : 'auto' }}>
                                    <CustomSelect
                                        field={field}
                                        data={CONDICIONES}
                                        label="Condición"
                                        getOptionLabel={(cond) => cond.descripcion}
                                        getOptionValue={(cond) => cond.id}
                                        error={errors.id_estado_condicion?.message}
                                    />
                                </div>
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
                                    placeholder="Óleo, Acrílico, etc."
                                    error={errors.tecnica?.message}
                                    disabled={!canEdit || isLoadingData || isSubmitting}
                                />
                            )}
                        />
                    </div>

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
                                    placeholder="100x80 cm"
                                    error={errors.dimensiones?.message}
                                    disabled={!canEdit || isLoadingData || isSubmitting}
                                />
                            )}
                        />
                    </div>

                    {/* Material de Soporte */}
                    <div>
                        <Controller
                            name="material_soporte"
                            control={control}
                            render={({ field }) => (
                                <CustomInputField
                                    {...field}
                                    label="Material de soporte"
                                    type="text"
                                    placeholder="Lienzo, Papel, etc."
                                    error={errors.material_soporte?.message}
                                    disabled={!canEdit || isLoadingData || isSubmitting}
                                />
                            )}
                        />
                    </div>

                    {/* Procedencia */}
                    <div>
                        <Controller
                            name="procedencia"
                            control={control}
                            render={({ field }) => (
                                <CustomInputField
                                    {...field}
                                    label="Procedencia"
                                    type="text"
                                    placeholder="Origen o provenance de la obra"
                                    error={errors.procedencia?.message}
                                    disabled={!canEdit || isLoadingData || isSubmitting}
                                />
                            )}
                        />
                    </div>

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
                                    step="0.01"
                                    placeholder="0.00"
                                    error={errors.valor_estimado?.message}
                                    disabled={!canEdit || isLoadingData || isSubmitting}
                                />
                            )}
                        />
                    </div>

                    {/* Certificado de Autenticidad */}
                    <div>
                        <Label className="flex items-center gap-3 cursor-pointer" style={{ opacity: !canEdit || isLoadingData || isSubmitting ? 0.5 : 1 }}>
                            <Controller
                                name="certificado_autenticidad"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="checkbox"
                                        checked={field.value}
                                        onChange={(e) => field.onChange(e.target.checked)}
                                        disabled={!canEdit || isLoadingData || isSubmitting}
                                        className="h-5 w-5 rounded border-[#6FB8E6] bg-[#194174]/40 text-[#ECB44D] disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                )}
                            />
                            <span className="text-sm font-medium text-[#F2E199]">
                                Tiene certificado de autenticidad
                            </span>
                        </Label>
                    </div>

                    {/* Categorías */}
                    {categoriasDisponibles.length > 0 && (
                        <div>
                            <Label className="mb-3 block text-sm font-medium text-[#F2E199]">
                                Categorías (selecciona al menos una)
                            </Label>
                            <div className="grid gap-2 sm:grid-cols-2" style={{ opacity: !canEdit || isLoadingData || isSubmitting ? 0.5 : 1, pointerEvents: !canEdit || isLoadingData || isSubmitting ? 'none' : 'auto' }}>
                                {categoriasDisponibles.map((categoria) => (
                                    <label
                                        key={categoria.id}
                                        className="flex items-center gap-2 rounded-lg border border-[#6FB8E6]/40 bg-[#194174]/20 p-3 cursor-pointer transition hover:bg-[#194174]/40"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={categoriasSeleccionadas.includes(Number(categoria.id))}
                                            onChange={() => handleCategoriaToggle(Number(categoria.id))}
                                            disabled={!canEdit || isLoadingData || isSubmitting}
                                            className="h-4 w-4 rounded border-[#6FB8E6] bg-[#194174]/40 text-[#ECB44D] disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                        <span className="text-sm text-[#F2E199]">
                                            {categoria.descripcion}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Imágenes Actuales */}
                    {imagenesActuales.length > 0 && (
                        <div>
                            <Label className="mb-3 block text-sm font-medium text-[#F2E199]">
                                Imágenes actuales
                            </Label>
                            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                                {imagenesActuales.map((imagen) => {
                                    const imageUrl = getImageUrl(imagen.datos);
                                    console.log(`Imagen ${imagen.id}:`, imageUrl);
                                    return (
                                        <div key={imagen.id} className="relative">
                                            <div className="h-32 w-full rounded-md border border-[#6FB8E6]/30 overflow-hidden bg-[#194174]/40">
                                                <img
                                                    src={imageUrl}
                                                    alt="Cuadro"
                                                    className="h-full w-full object-cover"
                                                    onError={(e) => {
                                                        console.error("Error cargando imagen:", imageUrl);
                                                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23194174' width='100' height='100'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' fill='%236FB8E6' font-size='12'%3EError%3C/text%3E%3C/svg%3E";
                                                    }}
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removerImagenActual(imagen.id)}
                                                disabled={!canEdit || isSubmitting}
                                                className="absolute -right-2 -top-2 rounded-full bg-[#ECB44D] p-1 hover:bg-[#ECB44D]/80 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <X className="h-4 w-4 text-[#171741]" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                            <p className="mt-2 text-xs text-[#6FB8E6]">
                                Total: {imagenesActuales.length} imagen{imagenesActuales.length !== 1 ? "es" : ""}
                            </p>
                        </div>
                    )}

                    {/* Nuevas Imágenes */}
                    <div>
                        <Label className="mb-3 block text-sm font-medium text-[#F2E199]">
                            Agregar imágenes (máximo {5 - imagenesActuales.length + imagenesAEliminar.length} más)
                        </Label>
                        <div className="rounded-md border-2 border-dashed border-[#6FB8E6]/40 bg-[#194174]/10 p-6" style={{ opacity: !canEdit || isLoadingData || isSubmitting ? 0.5 : 1, pointerEvents: !canEdit || isLoadingData || isSubmitting ? 'none' : 'auto' }}>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImagenesChange}
                                disabled={imagenesSeleccionadas.length >= (5 - imagenesActuales.length + imagenesAEliminar.length) || !canEdit || isSubmitting}
                                className="hidden"
                                id="nuevas-imagenes-input"
                            />
                            <label
                                htmlFor="nuevas-imagenes-input"
                                className="cursor-pointer text-center"
                            >
                                <p className="text-sm text-[#F2E199]">
                                    Sube imágenes adicionales del cuadro
                                </p>
                                <p className="mt-1 text-xs text-[#6FB8E6]">
                                    Soporta: JPG, PNG, GIF, WebP
                                </p>
                            </label>
                        </div>

                        {/* Vista previa de nuevas imágenes */}
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
                                            onClick={() => removerImagenNueva(index)}
                                            disabled={isSubmitting}
                                            className="absolute -right-2 -top-2 rounded-full bg-[#ECB44D] p-1 hover:bg-[#ECB44D]/80 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <X className="h-4 w-4 text-[#171741]" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <p className="mt-2 text-xs text-[#6FB8E6]">
                            Nuevas imágenes: {imagenesSeleccionadas.length}
                        </p>
                    </div>

                    {/* Botones */}
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
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
                            disabled={!canEdit || isSubmitting || isLoadingData}
                        >
                            <Save className="h-4 w-4" />
                            {isSubmitting ? "Guardando..." : "Guardar cambios"}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
