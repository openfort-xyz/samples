import { FC, ReactNode, ChangeEvent } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

const formClasses =
  "block w-full appearance-none rounded-md border border-gray-200 bg-white py-[calc(theme(spacing.2)-1px)] px-[calc(theme(spacing.3)-1px)] text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-orange-500 sm:text-sm";

interface LabelProps {
  id: string;
  children: ReactNode;
}

const Label: FC<LabelProps> = ({ id, children }) => (
  <label htmlFor={id} className="mb-2 block text-sm font-medium text-gray-900">
    {children}
  </label>
);

interface TextFieldProps {
  id: string;
  label?: string;
  type?: string;
  className?: string;
  setShow?: (show: boolean) => void;
  show?: boolean;
}

export const TextField: FC<TextFieldProps> = ({
  id,
  label,
  type = "text",
  className,
  setShow,
  show,
  ...props
}) => (
  <div className={className}>
    {label && <Label id={id}>{label}</Label>}
    <div className="relative flex items-center">
      <input
        id={id}
        type={type === "password" && !show ? "password" : "text"}
        {...props}
        className={formClasses}
      />
      {setShow && (
        <button
          type="button"
          onClick={() => {
            setShow(!show);
          }}
          className="absolute inset-0 left-auto"
          aria-label="show"
        >
          <span
            className="absolute inset-0 right-auto my-2 -ml-px w-px bg-gray-300"
            aria-hidden="true"
          ></span>
          {!show ? (
            <div className="text-gray-500 mx-3 flex flex-shrink-0 opacity-75">
              <EyeIcon className="h-5 w-5" />
            </div>
          ) : (
            <div className="text-gray-500 mx-3 flex flex-shrink-0 opacity-75">
              <EyeSlashIcon className="h-5 w-5" />
            </div>
          )}
        </button>
      )}
    </div>
  </div>
);

interface SelectFieldProps {
  id: string;
  label?: string;
  className?: string;
}

export const SelectField: FC<SelectFieldProps> = ({
  id,
  label,
  className,
  ...props
}) => (
  <div className={className}>
    {label && <Label id={id}>{label}</Label>}
    <select id={id} {...props} className={clsx(formClasses, "pr-8")} />
  </div>
);
