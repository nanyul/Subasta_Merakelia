import { useEffect, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// shadcn/ui
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// icons
import { Plus, Save, ArrowLeft } from "lucide-react";

// servicios
import GenreService from "../../services/GenreService";
import ActorService from "../../services/ActorService";
import DirectorService from "../../services/DirectorService";
import MovieService from "../../services/MovieService";
import ImageService from "../../services/ImageService";

// componentes reutilizables
import { CustomMultiSelect } from "../ui/custom/custom-multiple-select"; // select multi con chips
import { ActorsForm } from "./Form/ActorsForm";
import { CustomSelect } from "../ui/custom/custom-select";
import { CustomInputField } from "../ui/custom/custom-input-field";

export function CreateMovie() {
  const navigate = useNavigate();

  /*** Estados para selects y preview de imagen ***/
  const [dataDirector, setDataDirector] = useState([]);
  const [dataGenres, setDataGenres] = useState([]);
  const [dataActors, setDataActors] = useState([]);
  const [file, setFile] = useState(null);
  const [fileURL, setFileURL] = useState(null);
  const [error, setError] = useState("");

  /*** Esquema de validación Yup ***/
  const movieSchema= yup.object({
    
  })

  /*** React Hook Form ***/
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      year: "",
      time: "",
      lang: "",
      director_id: "",
      genres: [],
      actors: [{ actor_id: "", role: "" }], 
    },
    resolver:yupResolver(movieSchema)
  });
  //Array de controles para actores
   const { fields, append, remove } = useFieldArray({ 
    control, 
    name: "actors", 
  });
  //Acciones para la gestión del array de actores
  const addNewActor = () => append({ actor_id: "", role: "" }); 
  const removeActor = (index) => { 
      if (fields.length > 1) remove(index); 
  }; 


  /*** Manejo de imagen ***/
  const handleChangeImage = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileURL(URL.createObjectURL(selectedFile));
    }
  };
  /***Listados de carga en el formulario ***/
  useEffect(()=>{
    const fechData=async()=>{
      try {
        //Lista de directores
        const directorsRes= await DirectorService.getDirectores()
        //Lista de generos
        const genresRes= await GenreService.getGenres()
        //Lista de actores
        const actorsRes= await ActorService.getActors()
        // Si la petición es exitosa, se guardan los datos 
        setDataDirector(directorsRes.data.data || []); 
        setDataGenres(genresRes.data.data || []); 
        setDataActors(actorsRes.data.data || []); 
        console.log(directorsRes) 
        console.log(genresRes) 
        console.log(actorsRes) 
      } catch (error) {
        console.log(error)
        if(error.name != "AbortError") setError(error.message)
      }
    }
    fechData()
  },[])

  /*** Submit ***/
  const onSubmit = async (dataForm) => {
    if (!file) {
      toast.error("Debes seleccionar una imagen para la película");
      return;
    }

    try {
      console.log(dataForm)
      if (movieSchema.isValid()) { 
        //Verificar datos del formulario 
        console.log(dataForm) 
        //Crear pelicula en el API 
        
      } 
    } catch (err) {
      console.error(err);
      setError("Error al crear película");
    }
  };

  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <Card className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Crear Película</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Título */}
        <div>
          <Label className="block mb-1 text-sm font-medium" htmlFor="title">Título</Label>
          {/* Controller entrada título */}
          
          {/* Error entrada título */}
          
        </div>

        {/* Año*/}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            {/* Controller entrada year */}
            <Controller name="year" control={control} render={({field})=>
              <CustomInputField 
                {...field} 
                label="Año" 
                placeholder="2025"
                error={errors.year?.message}
              />
            } />
          </div>
          {/*Duración*/}
          <div>
            <Controller
              name="time"
              control={control}
              render={({ field }) =>
                <CustomInputField
                  {...field}
                  label="Duración (min)"
                  placeholder="160"
                  error={errors.time?.message} />
              }
            />
          </div>
          {/*Idioma*/}
          <div>
            <Controller
              name="lang"
              control={control}
              render={({ field }) =>
                <CustomInputField
                  {...field}
                  label="Idioma"
                  placeholder="Español"
                  error={errors.lang?.message} />}
            />
          </div>
        </div>

        {/* Director */}
        <div>
          <Label className="block mb-1 text-sm font-medium">Director</Label>
          {/* Controller entrada director */}
          <Controller name="director_id" control={control} render={({field})=> 
            <CustomSelect
              field={field}
              data={dataDirector}
              label="Director"
              getOptionLabel={(director)=>`${director.fname} ${director.lname}`}
              getOptionValue={(director)=> director.id} 
              error={errors.director_id?.message}
            />
          } />
        </div>
        {/* Géneros */}
        <div>
          {/* Controller entrada generos */}
          <Controller name="genres" control={control} render={({field})=> 
            <CustomMultiSelect
              field={field}
              data={dataGenres}
              label="Géneros"
              getOptionLabel={(item)=>item.title}
              getOptionValue={(item)=> item.id} 
              error={errors.genres?.message}
              placeholder="Seleccione géneros"
            />
          } />
        </div>
        {/* Actores */}
        <div>
          <div className="flex items-center justify-between">
            <Label className="block mb-1 text-sm font-medium">Actores</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="button" size="icon" onClick={addNewActor}
                  className="bg-accent text-accent-foreground hover:bg-accent/90" >
                    <Plus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Agregar actor</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="space-y-4 mt-3">
            {/* Listar los actores con sus respectivos controles */}
            {fields.map((field,index)=>
              <ActorsForm 
                key={field.id}
                index={index}
                control={control}
                data={dataActors}
                onRemove={removeActor}
                disableRemoveButton={fields.length===1}
                error={errors}
              />
            )}
          </div>
        </div>
        {/* Imagen */}
        <div className="mb-6">
          <Label htmlFor="image" className="block mb-1 text-sm font-medium">
            Imagen
          </Label>

          <div
            className="relative w-56 h-56 border-2 border-dashed border-muted/50 rounded-lg flex items-center justify-center cursor-pointer overflow-hidden hover:border-primary transition-colors"
            onClick={() => document.getElementById("image").click()}
          >
            {!fileURL && (
              <div className="text-center px-4">
                <p className="text-sm text-muted-foreground">Haz clic o arrastra una imagen</p>
                <p className="text-xs text-muted-foreground">(jpg, png, máximo 5MB)</p>
              </div>
            )}
            {fileURL && (
              <img
                src={fileURL}
                alt="preview"
                className="w-full h-full object-contain rounded-lg shadow-sm"
              />
            )}
          </div>

          <input
            type="file"
            id="image"
            className="hidden"
            accept="image/*"
            onChange={handleChangeImage}
          />
        </div>

        <div className="flex justify-between gap-4 mt-6">
          <Button
            type="button"
            variant="default" // sólido
            className="flex items-center gap-2 bg-accent text-white"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4" />
            Regresar
          </Button>
          {/* Botón Guardar */}
          <Button type="submit" className="flex-1">
            <Save className="w-4 h-4" />
            Guardar
          </Button>
        </div>
      </form>
    </Card>
  );
}
