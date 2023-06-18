export interface MaterialIconProps {
  icon: string;
  className?: string;
}

export function MaterialIcon({ icon, className }: MaterialIconProps) {
  return (
    <span
      className={className ? `material-icons ${className}` : `material-icons`}
    >
      {icon}
    </span>
  );
}
