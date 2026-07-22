export interface CreateDistrictDto {
  name: string;
  code: string;
  stateId: string;
}

export interface UpdateDistrictDto {
  name?: string;
  code?: string;
  stateId?: string;
}

export interface DistrictResponse {
  id: string;
  name: string;
  code: string;
  stateId: string;
  createdAt: Date;
  updatedAt: Date;
}
