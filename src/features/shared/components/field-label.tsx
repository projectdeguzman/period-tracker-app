type FieldLabelProps = {
  children: string;
  optional?: boolean;
  required?: boolean;
};

export function FieldLabel({
  children,
  optional = false,
  required = false,
}: FieldLabelProps) {
  return (
    <span className="mb-2 block text-sm font-semibold">
      {children}
      {required ? (
        <span className="ml-1 text-accent-strong" aria-hidden="true">
          *
        </span>
      ) : null}
      {optional ? (
        <span className="ml-2 text-xs font-medium text-foreground/52">Optional</span>
      ) : null}
    </span>
  );
}
