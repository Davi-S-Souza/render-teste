"use client";

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Navigation, Filter } from "lucide-react";
import { OSMSearchMap } from "@/components/mapSearch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Map = dynamic(() => import("../map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-gray-200 rounded-lg flex items-center justify-center">
      <p className="text-gray-500">Carregando mapa...</p>
    </div>
  ),
});

export type MarkerCategory = string;

export type MapMarker = {
  id: number;
  lat: number;
  lng: number;
  category: MarkerCategory;
  categoryColor: string;
  title: string;
  description: string;
  status: "Pendente" | "Em Revisão" | "Resolvido";
  images?: string[];
};

type Category = {
  id: number;
  name: string;
  color: string;
};

export function MapView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set()); // ⬅️ Começa vazio
  const [focusPosition, setFocusPosition] = useState<[number, number] | undefined>(undefined);

  const filteredMarkers = useMemo(() => {
    return markers.filter((marker: MapMarker) => {
      const matchesCategory = activeCategories.size === 0 || activeCategories.has(marker.category);
      
      const matchesSearch = 
        marker.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        marker.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesCategory && (searchQuery === "" || matchesSearch);
    });
  }, [activeCategories, searchQuery, markers]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (!res.ok) throw new Error('Falha ao carregar categorias');
        const data: Category[] = await res.json();
        setCategories(data);
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      }
    };

    const loadMarkers = async () => {
      try {
        const res = await fetch('/api/posts/markers');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Array<{ 
          id: number; 
          lat: number; 
          lng: number; 
          category: string; 
          categoryColor: string;
          title: string; 
          description: string; 
          status: string; 
          images?: string[]; 
        }> = await res.json();
        const mapped: MapMarker[] = data.map(d => ({
          id: d.id,
          lat: d.lat,
          lng: d.lng,
          category: d.category || 'Outros',
          categoryColor: d.categoryColor || '#6b7280',
          title: d.title,
          description: d.description,
          status: d.status === 'Resolvido' ? 'Resolvido' : d.status === 'Pendente' ? 'Pendente' : 'Em Revisão',
          images: d.images || [],
        }));
        setMarkers(mapped);
      } catch (e) {
        console.error('Falha ao carregar marcadores', e);
        setMarkers([]);
      }
    };

    loadCategories();
    loadMarkers();
  }, []);

  const toggleCategory = (categoryName: string) => {
    setActiveCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName);
      } else {
        newSet.add(categoryName);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-4">
      {/* barra de busca e filtros */}
      <Card className="border-green-200 p-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por post"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-green-200">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
                {/* ⬅️ Badge mostrando quantos filtros ativos */}
                {activeCategories.size > 0 && (
                  <span className="ml-2 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {activeCategories.size}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            {/* ⬅️ Adicionado onCloseAutoFocus para prevenir fechar ao clicar */}
            <DropdownMenuContent 
              className="w-56 border-green-200"
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              {categories.map((cat) => (
                <DropdownMenuCheckboxItem
                  key={cat.id}
                  checked={activeCategories.has(cat.name)}
                  onCheckedChange={() => toggleCategory(cat.name)}
                  onSelect={(e) => e.preventDefault()} // ⬅️ Previne fechar ao selecionar
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: cat.color }}
                    />
                    {cat.name}
                  </div>
                </DropdownMenuCheckboxItem>
              ))}
              
              {/* ⬅️ Botão para limpar filtros */}
              {activeCategories.size > 0 && (
                <>
                  <div className="border-t my-1" />
                  <button
                    onClick={() => setActiveCategories(new Set())}
                    className="w-full text-left px-2 py-1.5 text-xs text-gray-500 hover:bg-gray-100 rounded"
                  >
                    Limpar filtros
                  </button>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" className="border-green-200">
            <Navigation className="h-4 w-4 mr-2" />
            Minha localização
          </Button>
        </div>

        <div className="mt-3">
          <OSMSearchMap onSelect={(pos) => setFocusPosition(pos)} />
        </div>

        {/* Legenda de categorias ativas */}
        {activeCategories.size > 0 ? (
          <div className="flex flex-wrap gap-2 mt-3">
            {categories.filter(cat => activeCategories.has(cat.name)).map((cat) => (
              <Badge 
                key={cat.id} 
                variant="secondary" 
                className="text-xs cursor-pointer hover:bg-gray-200"
                onClick={() => toggleCategory(cat.name)}
              >
                <div 
                  className="w-2 h-2 rounded-full mr-1" 
                  style={{ backgroundColor: cat.color }}
                />
                {cat.name}
                <span className="ml-1 text-gray-400">×</span>
              </Badge>
            ))}
          </div>
        ) : (
          <div className="text-xs text-gray-500 mt-3">
            Mostrando todas as categorias
          </div>
        )}
      </Card>

      {/* Mapa */}
      <Card className="border-green-200 overflow-hidden">
        <Map markers={filteredMarkers} focusPosition={focusPosition} categories={categories} />
      </Card>
    </div>
  );
}