// =============================================================================
// COMPONENTE: TARJETA DE PAÍS - Country Explorer
// =============================================================================
// Este módulo define cómo se renderiza cada país en la lista de resultados.
//
// ## ¿Qué es un "componente" sin framework?
// Sin React/Vue, un componente es simplemente una función que:
// 1. Recibe datos (props)
// 2. Devuelve un elemento del DOM
// 3. Puede encapsular lógica de eventos
//
// Este patrón se llama "Factory Function" o "Component Factory".
// =============================================================================

import type { Country } from '../types/country';
import { formatNumber, formatCapitals } from '../utils/format';
import { createElement } from '../utils/dom';
import { isFavorite, toggleFavorite } from '../utils/storage'; // Importación nueva

/**
 * Crea una tarjeta de país para mostrar en la lista.
 * * @param country - Datos del país a renderizar
 * @param onClick - Callback cuando se hace click en la tarjeta
 * @returns Elemento article con la tarjeta del país
 */
export function createCountryCard(
  country: Country,
  onClick: (country: Country) => void
): HTMLElement {
  // Creamos el contenedor principal usando nuestra utilidad
  const card = createElement('article', 'country-card', 'cursor-pointer');

  // Agregamos atributos de accesibilidad
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', `Ver detalles de ${country.name.common}`);

  // Comprobamos si es favorito para el estado inicial del icono
  const favorite = isFavorite(country.name.common);

  // =========================================================================
  // CONSTRUCCIÓN DEL HTML
  // =========================================================================
  card.innerHTML = `
    <div class="relative">
      <img
        src="${country.flags.svg}"
        alt="${country.flags.alt ?? `Bandera de ${country.name.common}`}"
        class="w-full h-48 object-cover"
        loading="lazy"
      />
      <button 
        class="favorite-btn absolute top-3 left-3 p-2 rounded-full bg-slate-900/60 text-white hover:bg-slate-900 transition-colors backdrop-blur-sm"
        aria-label="Agregar a favoritos"
      >
        <svg class="w-6 h-6 ${favorite ? 'fill-red-500 stroke-red-500' : 'fill-none stroke-current'}" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>

      <span class="absolute top-3 right-3 px-3 py-1 bg-slate-900/80 text-slate-200 text-xs font-medium rounded-full backdrop-blur-sm">
        ${country.region}
      </span>
    </div>

    <div class="p-5">
      <h2 class="text-xl font-bold text-white mb-2 truncate">
        ${country.name.common}
      </h2>

      ${
        country.name.official !== country.name.common
          ? `<p class="text-slate-400 text-sm mb-3 truncate" title="${country.name.official}">
          ${country.name.official}
        </p>`
          : ''
      }

      <div class="space-y-2 text-sm">
        <div class="flex items-center gap-2 text-slate-300">
          <span class="text-slate-500">Capital:</span>
          <span class="truncate">${formatCapitals(country.capital)}</span>
        </div>

        <div class="flex items-center gap-2 text-slate-300">
          <span class="text-slate-500">Poblacion:</span>
          <span>${formatNumber(country.population)}</span>
        </div>

        <div class="flex items-center gap-2 text-slate-300">
          <span class="text-slate-500">Subregion:</span>
          <span class="truncate">${country.subregion ?? country.region}</span>
        </div>
      </div>

      <div class="mt-4 flex items-center gap-2 text-blue-400 text-sm font-medium">
        <span>Ver más detalles</span>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  `;

  // =========================================================================
  // EVENT LISTENERS
  // =========================================================================

  // Manejador del botón de favoritos
  const favoriteBtn = card.querySelector('.favorite-btn') as HTMLButtonElement;
  favoriteBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Evita que se abra el modal al hacer clic en el corazón
    toggleFavorite(country.name.common);
    
    // Actualizamos el aspecto visual del icono inmediatamente
    const icon = favoriteBtn.querySelector('svg');
    if (icon) {
      const isFav = isFavorite(country.name.common);
      icon.classList.toggle('fill-red-500', isFav);
      icon.classList.toggle('stroke-red-500', isFav);
      icon.classList.toggle('fill-none', !isFav);
      icon.classList.toggle('stroke-current', !isFav);
    }
  });

  // Manejador de click (Abre el modal)
  card.addEventListener('click', () => {
    onClick(country);
  });

  // Manejador de teclado para accesibilidad
  card.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick(country);
    }
  });

  return card;
}

/**
 * Renderiza una lista de países en un contenedor.
 */
export function renderCountryList(
  countries: Country[],
  container: HTMLElement,
  onCardClick: (country: Country) => void
): void {
  container.replaceChildren();
  const fragment = document.createDocumentFragment();

  for (const country of countries) {
    const card = createCountryCard(country, onCardClick);
    fragment.appendChild(card);
  }

  container.appendChild(fragment);
}