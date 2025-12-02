"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Camera, X, Tag, Navigation, MapPin } from "lucide-react"
import Link from "next/link"
import exifr from "exifr"
import { OSMSearchMap } from "@/components/mapSearch"
import { authService } from "@/lib/authService"
import type { User } from "@/@types/user";
import { getImageUrl } from "@/lib/config";

const MapPicker = dynamic(() => import("../mapPicker"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] bg-gray-200 rounded-lg flex items-center justify-center">
      <p className="text-gray-500">Carregando mapa...</p>
    </div>
  ),
});

type Category = {
  id: number;
  name: string;
  color: string;
};

const TITLE_MAX_LENGTH = 40;
const DESCRIPTION_MAX_LENGTH = 400;

export function Post() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [latitude, setLatitude] = useState<string>("")
  const [longitude, setLongitude] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  const [isExtractingLocation, setIsExtractingLocation] = useState(false)
  const [error, setError] = useState<string>("")
  const [locationMessage, setLocationMessage] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const errorRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const loadUserAndCategories = async () => {
      try {
        const user = await authService.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        router.push('');
        return;
      }

      try {
        const res = await fetch('/api/categories');
        if (!res.ok) throw new Error('Falha ao carregar categorias');
        const data: Category[] = await res.json();
        setCategories(data);
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      }
    };
    loadUserAndCategories();
  }, [router]);

  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [error]);

  const handleFilesSelected = async (files: File[]) => {
    setSelectedFiles(files)
    if (files.length === 0) return
    const previews = files.map((f) => URL.createObjectURL(f))
    setImageUrls(previews)
  }

  const removeImage = (index: number) => {
    setImageUrls((prev) => {
      const toRemove = prev[index]
      try {
        if (toRemove?.startsWith("blob:")) URL.revokeObjectURL(toRemove)
      } catch (e) {
      }
      return prev.filter((_, i) => i !== index)
    })
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocalização não é suportada pelo seu navegador")
      return
    }
    setError("")
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6))
        setLongitude(position.coords.longitude.toFixed(6))
      },
      (error) => {
        console.error("Erro ao obter localização:", error)
        setError("Não foi possível obter sua localização. Verifique as permissões do navegador.")
      }
    )
  }

  const handleMapClick = (lat: number, lng: number) => {
    setLatitude(lat.toFixed(6))
    setLongitude(lng.toFixed(6))
  }

  const extractLocationFromImage = async () => {
    if (selectedFiles.length === 0) {
      setError("Por favor, adicione pelo menos uma imagem antes")
      return
    }

    setError("")
    setLocationMessage("")
    setIsExtractingLocation(true)
    
    try {
      // passa por todas as fotos
      for (const file of selectedFiles) {
        try {
          //tenta pegar o gps da foto
          const gps = await exifr.gps(file)
          //se achar latitude e longitude na foto
          if (gps && gps.latitude && gps.longitude) { 
            //retorna setta a latitude e longitude (tofixed e pra deixar com 6 decimais)
            setLatitude(gps.latitude.toFixed(6))
            setLongitude(gps.longitude.toFixed(6)) 
            //mostra q conseguiu extrair
            setLocationMessage(`Localização extraída com sucesso! Lat: ${gps.latitude.toFixed(6)}, Lng: ${gps.longitude.toFixed(6)}`)
            setIsExtractingLocation(false)
            return
          }
        } catch (err) {
          console.log(`Erro ao tentar capturar a localização: ${file.name}`)
        }
      }
      
      // se nada de gps for encontrado
      
      setError("Nenhuma imagem contém dados de localização GPS. Dica: Tire fotos com a localização ativada no seu celular.")
    } catch (error) {
      console.error("Erro ao extrair localização:", error)
      setError("Erro ao processar as imagens. Tente novamente.")
    } finally {
      setIsExtractingLocation(false)
    }
  }

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      setError("Título e descrição são obrigatórios")
      return
    }

    if (!latitude || !longitude) {
      setError("Localização é obrigatória. Clique no mapa, use sua localização atual ou extraia das imagens.")
      return
    }

    setError("")
    setIsLoading(true)
    try {
      let uploadedUrls: string[] = []
      if (selectedFiles.length > 0) {
        setIsUploadingImages(true)
        try {
          const uploads = await Promise.all(
            selectedFiles.map(async (file) => {
              const form = new FormData()
              form.append("file", file)
              const res = await fetch("/api/uploads", {
                method: "POST",
                body: form,
              })
              if (!res.ok) {
                const text = await res.text()
                throw new Error(text || `HTTP ${res.status}`)
              }
              const url = await res.text()
              return url
            })
          )
          uploadedUrls = uploads
          setImageUrls(uploadedUrls)
        } catch (uerr) {
          console.error("Erro ao enviar imagens:", uerr)
          setError("Erro ao enviar imagens. Não foi possível publicar o post.")
          setIsUploadingImages(false)
          setIsLoading(false)
          return
        } finally {
          setIsUploadingImages(false)
        }
      }
      if (!currentUser) {
        setError("Você precisa estar logado para criar um post");
        setIsLoading(false);
        return;
      }

      const body = {
        title: title.trim(),
        content: content.trim(),
        authorId: currentUser.id,
        images: uploadedUrls && uploadedUrls.length > 0 ? uploadedUrls : imageUrls,
        categoryId: categoryId,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
      }

      const token = authService.getToken();
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch("/api/posts", {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `HTTP ${res.status}`)
      }

      router.push("/home/?postCreated=true")
    } catch (err: any) {
      console.error("Erro ao criar post:", err)
      setError("Não foi possível criar o post. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-green-200">
      <CardContent className="p-6">
        {/* Header do Post */}
        <div className="flex items-start justify-between mb-6">
          <Link href="/profile/">
            <div className="flex gap-3">
              <Avatar className="h-12 w-12 bg-white border-2 border-green-300">
                <AvatarFallback className="bg-green-100 text-green-700 font-semibold">
                  {currentUser?.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">{currentUser?.name || "Carregando..."} • Meu Perfil</p>
                <p className="text-xs text-gray-500">{currentUser?.email || ""}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-gray-400">Agora</span>
                </div>
              </div>
            </div>
          </Link>
          <Link href="/home/">
            <Button variant="ghost" size="icon">
              <X className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Formulário */}
        <div className="space-y-4">
          {/* Error Message */}
          {error && (
            <div 
              ref={errorRef}
              className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md"
            >
              {error}
            </div>
          )}
          
          {/* Location Success Message */}
          {locationMessage && (
            <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
              {locationMessage}
            </div>
          )}
          
          {/* Título */}
          <div className="relative">
            <Input
              value={title}
              onChange={(e) => {
                const newValue = (e.target as HTMLInputElement).value;
                if (newValue.length <= TITLE_MAX_LENGTH) {
                  setTitle(newValue);
                }
              }}
              placeholder="Insira o Título *"
              className="pr-16 border-green-300 hover:border-green-500"
            />
            <div className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium ${
              title.length > TITLE_MAX_LENGTH * 0.9 
                ? 'text-red-500' 
                : title.length > TITLE_MAX_LENGTH * 0.7 
                  ? 'text-yellow-500' 
                  : 'text-gray-400'
            }`}>
              {title.length}/{TITLE_MAX_LENGTH}
            </div>
          </div>

          {/* Descrição */}
          <div className="relative">
            <Textarea
              value={content}
              onChange={(e) => {
                const newValue = (e.target as HTMLTextAreaElement).value;
                if (newValue.length <= DESCRIPTION_MAX_LENGTH) {
                  setContent(newValue);
                }
              }}
              placeholder="Insira a Descrição *"
              rows={4}
              className="resize-none border-green-300 hover:border-green-500 pr-16"
            />
            <div className={`absolute right-3 bottom-3 text-xs font-medium ${
              content.length > DESCRIPTION_MAX_LENGTH * 0.9 
                ? 'text-red-500' 
                : content.length > DESCRIPTION_MAX_LENGTH * 0.7 
                  ? 'text-yellow-500' 
                  : 'text-gray-400'
            }`}>
              {content.length}/{DESCRIPTION_MAX_LENGTH}
            </div>
          </div>

              {/* Upload de Imagem */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from((e.target as HTMLInputElement).files || [])
                    if (files.length === 0) return
                    handleFilesSelected(files)
                    ;(e.target as HTMLInputElement).value = ""
                  }}
                />

                <div
                  role="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-green-300 rounded-lg p-6 flex flex-col items-center justify-center hover:border-green-400 cursor-pointer transition-colors"
                >
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Camera className="h-10 w-10 text-green-600" />
                  </div>
                  <p className="text-sm text-green-600">Clique para adicionar fotos</p>
                  <p className="text-xs text-green-800 mt-1">ou arraste e solte aqui</p>
                </div>

                {/* Previews */}
                {imageUrls.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {imageUrls.map((url, idx) => (
                      <div key={idx} className="relative">
                        <img
                          src={getImageUrl(url)}
                          alt={`preview-${idx}`}
                          className="w-full h-24 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 bg-white rounded-full p-1 text-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

          {/* Campos Adicionais - Categoria */}
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={categoryId || ""}
              onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
              className="w-full pl-10 pr-4 py-2 border border-green-300 rounded-md hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Selecionar Categoria</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Mapa para selecionar localização */}
          <div className="space-y-3 justify-around">
            <div className="mb-3">
              <OSMSearchMap onSelect={(pos) => {
                setLatitude(pos[0].toFixed(6))
                setLongitude(pos[1].toFixed(6))
              }} />
            </div>

            <div className="flex items-center justify-around">
              <label className="text-sm font-medium text-gray-700">
                Localização no Mapa {latitude && longitude && (
                  <span className="text-xs text-gray-500 font-normal">
                    ({parseFloat(latitude).toFixed(4)}, {parseFloat(longitude).toFixed(4)})
                  </span>
                )}
              </label>
            </div>

            <div className="border-2 border-green-300 rounded-lg overflow-hidden">
              <MapPicker
                onLocationSelect={handleMapClick}
                initialLat={latitude ? Number(latitude) : -27.5969}
                initialLng={longitude ? Number(longitude) : -48.5495}
              />
            </div>

            {!latitude && !longitude && (
              <p className="text-xs text-gray-500 text-center">
                Clique no mapa para marcar a localização da denúncia
              </p>
            )}
            <div className="flex items-center justify-around">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={extractLocationFromImage}
                    disabled={isExtractingLocation || selectedFiles.length === 0}
                    className="border-blue-300 hover:border-blue-500 text-blue-600"
                  >
                    <MapPin className="h-3 w-3 mr-1" />
                    {isExtractingLocation ? "Extraindo..." : "Extrair Localização"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleUseMyLocation}
                    className="border-green-300 hover:border-green-500"
                  >
                    <Navigation className="h-3 w-3 mr-1 text-xs md:text-sm" />
                    Localização Atual
                  </Button>
                </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t">
             <Link href="/home/">
              <Button
              variant="outline"
              className="border-green-300 hover:border-green-500"
              onClick={() => {
                setTitle("")
                setContent("")
                setCategoryId(null)
                setLatitude("")
                setLongitude("")
              }}
              disabled={isLoading}
            >
              Cancelar
            </Button>
           
            </Link>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleSubmit}
              disabled={isLoading || isUploadingImages}
            >
              {isLoading ? "Publicando..." : isUploadingImages ? "Enviando imagens..." : "Publicar Post"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}