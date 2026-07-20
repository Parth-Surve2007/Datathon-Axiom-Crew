export interface CreateEmployeeDto {
  badgeId: string;
  name: string;
  email: string;
  phone?: string;
  rankId: string;
  designationId?: string;
  stationId?: string;
  unitId?: string;
  isActive?: boolean;
  joinDate?: Date;
}

export interface UpdateEmployeeDto {
  name?: string;
  email?: string;
  phone?: string;
  rankId?: string;
  designationId?: string;
  stationId?: string;
  unitId?: string;
  isActive?: boolean;
  joinDate?: Date;
}

export interface EmployeeResponse {
  id: string;
  badgeId: string;
  name: string;
  email: string;
  phone?: string;
  rankId: string;
  designationId?: string;
  stationId?: string;
  unitId?: string;
  isActive: boolean;
  joinDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
