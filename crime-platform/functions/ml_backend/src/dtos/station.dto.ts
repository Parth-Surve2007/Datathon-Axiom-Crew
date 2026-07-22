export interface CreateStationDto {
  name: string;
  code: string;
  district: string;
  jurisdiction: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateStationDto {
  name?: string;
  code?: string;
  district?: string;
  jurisdiction?: string;
  latitude?: number;
  longitude?: number;
}

export interface StationResponse {
  id: string;
  name: string;
  code: string;
  district: string;
  jurisdiction: string;
  latitude?: number;
  longitude?: number;
  createdAt: Date;
  updatedAt: Date;
}
