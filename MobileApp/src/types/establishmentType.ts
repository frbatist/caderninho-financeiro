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
 * Retorna o nome em português de um tipo de estabelecimento
 * @param type Tipo do estabelecimento
 * @returns Nome em português ou 'Desconhecido' se não encontrado
 */
export function getEstablishmentTypeName(type: EstablishmentType): string {
  return establishmentTypeNames[type] || 'Desconhecido';
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
