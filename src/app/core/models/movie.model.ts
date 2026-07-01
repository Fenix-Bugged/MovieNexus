export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  release_date: string;
  runtime?: number; // Duración en minutos
  genres?: { id: number; name: string }[]; // Lista de géneros (Ej: Acción, Comedia)
}

export interface MovieResponse {
  results: Movie[];
  page: number;
  total_pages: number;
}

export interface WatchProvider {
  logo_path: string;
  provider_id: number;
  provider_name: string;
  display_priority: number;
}

export interface CountryProviders {
  link: string;
  flatrate?: WatchProvider[]; // Suscripción plana (Netflix, Disney+, etc.)
  rent?: WatchProvider[];     // Renta (Apple TV, Google Play)
  buy?: WatchProvider[];      // Compra
}

export interface WatchProvidersResponse {
  id: number;
  results: {
    [countryCode: string]: CountryProviders; // Indexado por código de país de 2 letras (ej: ES, CO, US)
  };
}

