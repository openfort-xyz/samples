import {
  forwardRef,
  ForwardRefRenderFunction,
  SVGProps,
  ButtonHTMLAttributes,
  AnchorHTMLAttributes,
  ReactNode,
} from "react";
import Link from "next/link";
import clsx from "clsx";

const ArrowIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m11.5 6.5 3 3.5m0 0-3 3.5m3-3.5h-9"
    />
  </svg>
);

const variantStyles = {
  primary: "rounded-md bg-zinc-900 py-1 px-3 text-white hover:bg-zinc-700",
  secondary:
    "rounded-md bg-zinc-100 py-1 px-3 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800/40 dark:text-zinc-400",
  filled: "rounded-md bg-zinc-900 py-1 px-3 text-white hover:bg-zinc-700",
  outline:
    "rounded-md py-1 px-3 text-zinc-700 ring-1 ring-inset ring-zinc-900/10 hover:bg-zinc-900/2.5 hover:text-zinc-900",
  text: "text-orange-600 hover:text-zinc-900",
};

type ButtonProps = {
  variant?: keyof typeof variantStyles;
  arrow?: "left" | "right";
  className?: string;
  href?: string;
  children?: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement> &
  AnchorHTMLAttributes<HTMLAnchorElement>;

const Button: ForwardRefRenderFunction<HTMLButtonElement, ButtonProps> = (
  { variant = "primary", arrow, className, href, ...props },
  ref
) => {
  className = clsx(
    "inline-flex gap-0.5 justify-center overflow-hidden text-sm font-medium transition",
    variantStyles[variant],
    className
  );
  let Component: React.ElementType = href ? Link : "button";

  let arrowIcon = (
    <ArrowIcon
      className={clsx(
        "mt-0.5 h-5 w-5",
        variant === "text" && "relative top-px",
        arrow === "left" && "-ml-1 rotate-180",
        arrow === "right" && "-mr-1"
      )}
    />
  );

  return href ? (
    <Component href={href} className={className} {...props}>
      {props.children}
      {arrow === "right" && arrowIcon}
    </Component>
  ) : (
    <button ref={ref} className={className} {...props} />
  );
};

export default forwardRef(Button);
