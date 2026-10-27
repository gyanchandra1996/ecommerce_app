export interface Slider {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  badge?: string;
  tag?: string;
  buttonText: string;
  buttonLink: string;
  imageUrl?: string;
  bgGradient?: string;
  textColor?: string;
  position: "main" | "side" | "triple_promo";
  displayOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
