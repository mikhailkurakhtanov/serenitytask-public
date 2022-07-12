import { PlantType } from "./plant-type.model";

export class Plant {
  id: number;
  name: string;
  creationDate: Date;
  age: number;
  level: number;
  currentExperience: number;
  maxExperience: number;
  totalDeadLeaves: number;
  isDead: boolean;
  isGrowthFinished: boolean;
  userId: string;

  plantType: PlantType;
}
