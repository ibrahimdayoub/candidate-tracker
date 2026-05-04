import { Field, FieldLabel, FieldError } from "@/components/ui/field"

export function FormField({
  label,
  error,
  children
}: {
  label: string
  error?: any
  children: React.ReactNode
}) {
  return (
    <Field data-invalid={!!error}>
      <FieldLabel>{label}</FieldLabel>
      {children}
      {error && <FieldError errors={[error]} />}
    </Field>
  )
}