export interface CarouselItem {
  id: string | number;
  image: string; // desktop
  imageMobile?: string; // mobile (opcional)
  title?: string;
  description?: string;
  link?: string;
}