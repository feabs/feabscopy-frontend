
"use client";

import Link, { type LinkProps as NextLinkProps } from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Props that NavLink itself consumes for its logic
interface NavLinkOwnProps {
  children: (isActive: boolean) => ReactNode;
  activeClassName?: string;
  className?: string; // className for the Link component itself, managed by NavLink
  exact?: boolean;
  href: string; // NavLink requires href directly
}

// Combine with NextLinkProps, but OMIT props that NavLink handles or defines itself.
// We omit 'href' and 'className' from NextLinkProps because NavLinkOwnProps already defines them.
// 'asChild' will be explicitly set on the <Link> component, so it's not needed in ...restOfNextLinkProps.
type NavLinkProps = Omit<NextLinkProps, 'href' | 'className' | 'asChild'> & NavLinkOwnProps;

export default function NavLink(props: NavLinkProps) {
  const {
    href,
    children,
    activeClassName = "",
    className: navLinkClassName = "", // This is the className intended for the <Link> tag
    exact = false,
    // All other props are assumed to be valid NextLinkProps (like 'replace', 'scroll', 'prefetch', etc.)
    ...restOfNextLinkProps 
  } = props;

  const pathname = usePathname();
  const isActive = exact ? pathname === href.toString() : pathname.startsWith(href.toString());

  // Combine the className passed to NavLink with the activeClassName if applicable
  const combinedClassName = cn(navLinkClassName, isActive ? activeClassName : "").trim();

  return (
    <Link
      href={href}
      {...restOfNextLinkProps} // Spread only the remaining valid NextLinkProps
      className={combinedClassName}
      asChild // Explicitly set asChild for next/link
    >
      {children(isActive)}
    </Link>
  );
}
