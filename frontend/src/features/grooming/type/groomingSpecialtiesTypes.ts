export interface GroomingSpecialtyResponse {
  id: string;
  name: string;
  description: string | null;
  assignedCount: number;
  assignedStaffNames: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateGroomingSpecialtyRequest {
  name: string;
  description?: string | null;
}

export interface UpdateGroomingSpecialtyRequest {
  name: string;
  description?: string | null;
}
