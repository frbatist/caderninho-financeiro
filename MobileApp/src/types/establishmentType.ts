/**
 * Tipos de estabelecimento disponíveis no sistema
 * Este enum deve estar sempre sincronizado com o backend (CaderninhoApi.Domain.Enums.EstablishmentType)
 */
export enum EstablishmentType {
  Supermarket = 1,
  ClothingStore = 2,
  GasStation = 3,
  OnlineService = 4,
  Games = 5,
  DepartmentStore = 6,
  Restaurant = 7,
  Delivery = 8,
  Charity = 9,
  Church = 10,
  Events = 11,
  Entertainment = 12,
  Pharmacy = 13,
  Health = 14,
  Other = 15
}

/**
 * Mapeamento dos tipos de estabelecimento para nomes em português
 * Sincronizado com os atributos [Display(Name = "")] do backend
 */
export const establishmentTypeNames: Record<EstablishmentType, string> = {
  [EstablishmentType.Supermarket]: 'Mercado',
  [EstablishmentType.ClothingStore]: 'Loja de Roupas',
  [EstablishmentType.GasStation]: 'Posto de Combustível',
  [EstablishmentType.OnlineService]: 'Serviço Online',
  [EstablishmentType.Games]: 'Games',
  [EstablishmentType.DepartmentStore]: 'Loja de Departamentos',
  [EstablishmentType.Restaurant]: 'Restaurante',
  [EstablishmentType.Delivery]: 'Delivery',
  [EstablishmentType.Charity]: 'Caridade',
  [EstablishmentType.Church]: 'Igreja',
  [EstablishmentType.Events]: 'Eventos',
  [EstablishmentType.Entertainment]: 'Lazer',
  [EstablishmentType.Pharmacy]: 'Farmácia',
  [EstablishmentType.Health]: 'Saúde',
  [EstablishmentType.Other]: 'Outros'
};

/**
 * Mapeamento dos tipos de estabelecimento para ícones
 */
export const establishmentTypeIcons: Record<EstablishmentType, string> = {
  [EstablishmentType.Supermarket]: '🛒',
  [EstablishmentType.ClothingStore]: '👗',
  [EstablishmentType.GasStation]: '⛽',
  [EstablishmentType.OnlineService]: '📺',
  [EstablishmentType.Games]: '🎮',
  [EstablishmentType.DepartmentStore]: '🏬',
  [EstablishmentType.Restaurant]: '🍽️',
  [EstablishmentType.Delivery]: '🏍️',
  [EstablishmentType.Charity]: '❤️',
  [EstablishmentType.Church]: '⛪',
  [EstablishmentType.Events]: '🎵',
  [EstablishmentType.Entertainment]: '🎬',
  [EstablishmentType.Pharmacy]: '💊',
  [EstablishmentType.Health]: '🏥',
  [EstablishmentType.Other]: '🏪'
};

/**
 * Mapeamento dos tipos de estabelecimento para cores (para UI)
 */
export const establishmentTypeColors: Record<EstablishmentType, string> = {
  [EstablishmentType.Supermarket]: '#4CAF50',
  [EstablishmentType.ClothingStore]: '#E91E63',
  [EstablishmentType.GasStation]: '#FF9800',
  [EstablishmentType.OnlineService]: '#795548',
  [EstablishmentType.Games]: '#9C27B0',
  [EstablishmentType.DepartmentStore]: '#607D8B',
  [EstablishmentType.Restaurant]: '#FF6B35',
  [EstablishmentType.Delivery]: '#FF5722',
  [EstablishmentType.Charity]: '#E91E63',
  [EstablishmentType.Church]: '#3F51B5',
  [EstablishmentType.Events]: '#FF9800',
  [EstablishmentType.Entertainment]: '#FF5722',
  [EstablishmentType.Pharmacy]: '#2196F3',
  [EstablishmentType.Health]: '#F44336',
  [EstablishmentType.Other]: '#757575'
};

/**
 * Retorna o nome em português de um tipo de estabelecimento
 * @param type Tipo do estabelecimento
 * @returns Nome em português ou 'Desconhecido' se não encontrado
 */
export function getEstablishmentTypeName(type: EstablishmentType): string {
  return establishmentTypeNames[type] || 'Desconhecido';
}

/**
 * Retorna o ícone de um tipo de estabelecimento
 * @param type Tipo do estabelecimento
 * @returns Ícone emoji ou '❓' se não encontrado
 */
export function getEstablishmentTypeIcon(type: EstablishmentType): string {
  return establishmentTypeIcons[type] || '❓';
}

/**
 * Retorna a cor de um tipo de estabelecimento
 * @param type Tipo do estabelecimento
 * @returns Cor em hexadecimal ou '#757575' (cinza) se não encontrado
 */
export function getEstablishmentTypeColor(type: EstablishmentType): string {
  return establishmentTypeColors[type] || '#757575';
}

/**
 * Retorna informações completas de um tipo de estabelecimento
 * @param type Tipo do estabelecimento
 * @returns Objeto com text, icon e color
 */
export function getEstablishmentTypeInfo(type: EstablishmentType): { text: string; icon: string; color: string } {
  return {
    text: getEstablishmentTypeName(type),
    icon: getEstablishmentTypeIcon(type),
    color: getEstablishmentTypeColor(type)
  };
}

/**
 * Retorna todos os tipos de estabelecimento como array de opções para seleção
 * @returns Array com { value, label } para cada tipo
 */
export function getEstablishmentTypeOptions(): Array<{ value: EstablishmentType; label: string }> {
  return Object.entries(establishmentTypeNames).map(([value, label]) => ({
    value: Number(value) as EstablishmentType,
    label
  }));
}

/**
 * Retorna todos os tipos de estabelecimento como array de opções com ícones
 * Útil para dropdowns e seletores
 * @returns Array com { value, label, icon } para cada tipo
 */
export function getEstablishmentTypeOptionsWithIcons(): Array<{ value: EstablishmentType; label: string; icon: string }> {
  return Object.entries(establishmentTypeNames).map(([value, label]) => ({
    value: Number(value) as EstablishmentType,
    label,
    icon: establishmentTypeIcons[Number(value) as EstablishmentType]
  }));
}
