import type { SVGProps } from 'react';

const Logo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 200 50"
    width="120"
    height="30"
    aria-label="FeabsCopy Logo"
    {...props}
  >
    <rect width="200" height="50" rx="5" fill="hsl(var(--sidebar-primary))" className="group-hover:fill-sidebar-accent-foreground transition-colors duration-200"/>
    <text
      x="50%"
      y="50%"
      dominantBaseline="middle"
      textAnchor="middle"
      fontFamily="var(--font-geist-sans), system-ui, sans-serif"
      fontSize="24"
      fontWeight="bold"
      fill="hsl(var(--sidebar-primary-foreground))"
      className="group-hover:fill-sidebar-background transition-colors duration-200"
    >
      FeabsCopy
    </text>
  </svg>
);

export default Logo;

const SiteLogo = (props: SVGProps<SVGSVGElement>) => (
   <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 200 50"
    width="150"
    height="37.5" // Adjusted to maintain aspect ratio with width 150
    aria-label="FeabsCopy Logo"
    {...props}
  >
    <rect width="200" height="50" rx="5" fill="hsl(var(--primary))" />
    <text
      x="50%"
      y="50%"
      dominantBaseline="middle"
      textAnchor="middle"
      fontFamily="var(--font-geist-sans), system-ui, sans-serif"
      fontSize="24"
      fontWeight="bold"
      fill="hsl(var(--primary-foreground))"
    >
      FeabsCopy
    </text>
  </svg>
);
export { SiteLogo };
