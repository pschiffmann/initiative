export interface MaterialIconProps {
  icon: string;
}

export function MaterialIcon({ icon }: MaterialIconProps) {
  return <span className="material-icons">{icon}</span>;
}
