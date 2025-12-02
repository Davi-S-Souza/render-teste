import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";


// interface com oq vamo usar do nominatim 
interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  class?: string;
  type?: string;
  importance?: number;
}


export type OSMSearchMapProps = {
  onSelect?: (pos: [number, number]) => void;
};

export function OSMSearchMap({ onSelect }: OSMSearchMapProps) {

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const debounceRef = useRef<number | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement | null>(null);



  const fetchSuggestions = async (q: string) => {
    // so busca se tiver 2+ caracteres pro bounce nao ficar essquisito
    if (!q || q.length < 2) {
      setResults([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        q
      )}&limit=5&addressdetails=0&countrycodes=br&accept-language=pt-BR`;//final aqui e pra limitar
      //pra portugues e brasil
      const res = await fetch(url);
      const data: NominatimResult[] = await res.json();

      //podridao que vem do nominatim, isso é pra bloquear uma cota de coisa q ele puxa inutil
      const allowedTypes = new Set([
        'city','town','village','municipality','hamlet','suburb','neighbourhood','locality',
        'road','street','residential','house','building','postcode','commercial','amenity','station'
      ]);
      const disallowedTypes = new Set([
        'state','region','country','macroregion','county','continent','ocean'
      ]);

      const disallowedNameFragments = [
        'região geográfica',
        'regiao geografica',
        'região imediata',
        'regiao imediata',
        'região intermediária',
        'regiao intermediaria',
        'região',
        'regiao',
        'região sul',
        'regiao sul'
      ];

      const filtered = data.filter((r) => {
        
        const name = (r.display_name || '').toLowerCase();
        //filtra os nomes 
        for (const frag of disallowedNameFragments) {
          if (name.includes(frag)) return false;
        }
        //pega so os tipos q quero
        if (r.type && disallowedTypes.has(r.type)) return false;
        if (r.type && allowedTypes.has(r.type)) return true;
        //ficou meio ruim mas preguiça de refatorar, ta dando certo 
        if (r.class && (r.class === 'place' || r.class === 'building' || r.class === 'amenity' || r.class === 'highway')) return true;
        //ultimo filtro pra pegar resultados melhorres
        if (typeof r.importance === 'number' && r.importance > 0.5) return true;
        return false;
      });

      setResults(filtered.length > 0 ? filtered : data);
      setShowSuggestions(true);
      setActiveIndex(-1);
    } catch (err) {
      console.error('Erro nominatim', err);
      setResults([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (results.length > 0) {
      //joga a primeira sugestao (independe se ele escolheu uma especifica)
      const first = results[0];
      const pos: [number, number] = [parseFloat(first.lat), parseFloat(first.lon)];
      setShowSuggestions(false);
      setResults([]);
      if (onSelect) onSelect(pos);
      return;
    }

    setIsLoading(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&limit=1&countrycodes=br&accept-language=pt-BR`;
      const res = await fetch(url);
      const data: NominatimResult[] = await res.json();
      if (data.length > 0) {
        const pos: [number, number] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        if (onSelect) onSelect(pos);
      }
    } catch (err) {
      console.error('Erro Nominatim', err);
    } finally {
      setIsLoading(false);
    }
  };
  // debounce de 300ms quando digita 
  useEffect(() => {
    window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => fetchSuggestions(query), 300);
    return () => window.clearTimeout(debounceRef.current);
  }, [query]);

  // Fecha o dropdown de sugestoes quando clica fora do componente
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const handleSelect = (r: NominatimResult) => {
    //se ele clicar inves de dar enter
    const pos: [number, number] = [parseFloat(r.lat), parseFloat(r.lon)];
    setQuery(r.display_name);
    setShowSuggestions(false);
    setResults([]);
    if (onSelect) onSelect(pos);
  };

  // - seta para mover o foco entre sugestões
  // - emter para selecionar ativa (ou a primeira se nenhuma estiver ativa)
  // - esfc para fechar o dropdown
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const idx = activeIndex >= 0 ? activeIndex : 0;
      const r = results[idx];
      if (r) handleSelect(r);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex items-center gap-2">
        <Input
          name="pesquisa"
          value={query}
          onChange={(e) => { setQuery(e.target.value); }}
          onKeyDown={onKeyDown}
          placeholder="Buscar endereço..."
          className="w-full md:w-96"
        />

        <Button type="button" onClick={() => handleSearch()}>
          {isLoading ? (
            <span className="inline-flex items-center">
              <span className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2" />
              Buscando
            </span>
          ) : (
            <span className="inline-flex items-center"><Search className="w-4 h-4 mr-2" />Buscar</span>
          )}
        </Button>
      </form>

      {showSuggestions && results.length > 0 && (
        <ul className="absolute z-50 bg-white border rounded w-full mt-1 max-h-64 overflow-auto shadow" role="listbox">
          {results.map((r, idx) => (
            <li
              key={r.place_id}
              role="option"
              aria-selected={activeIndex === idx}
              className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${activeIndex === idx ? 'bg-gray-100' : ''}`}
              onMouseEnter={() => setActiveIndex(idx)}
              onClick={() => handleSelect(r)}
            >
              {
                (() => {
                  const parts = (r.display_name || '').split(',').map(p => p.trim());
                  const subtitleParts = parts.slice(1).filter(p => {
                    const low = p.toLowerCase();
                    return ![
                      'região geográfica','regiao geografica','região imediata','regiao imediata',
                      'região intermediária','regiao intermediaria','região','regiao','região sul','regiao sul'
                    ].some(f => low.includes(f));
                  });
                  const title = parts[0] || r.display_name;
                  const subtitle = subtitleParts.join(', ') || parts.slice(1).join(', ');

                  return (
                    <div>
                      <div className="text-sm text-gray-800 font-medium">{title}</div>
                      {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
                    </div>
                  );
                })()
              }
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
