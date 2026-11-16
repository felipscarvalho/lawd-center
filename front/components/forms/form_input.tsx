"use client";

import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { Input, type InputProps } from "@/components/base/input/input";

type FormInputProps<T extends FieldValues> = Omit<
  InputProps,
  "name" | "value" | "onChange" | "onBlur" | "isInvalid"
> & {
  control: Control<T>;
  name: Path<T>;
};

/** Input ligado ao react-hook-form: valor, validação e mensagem de erro (no lugar da dica) já conectados */
export function FormInput<T extends FieldValues>({ control, name, hint, ...props }: FormInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Input
          {...props}
          value={field.value ?? ""}
          onChange={field.onChange}
          onBlur={field.onBlur}
          isInvalid={Boolean(fieldState.error)}
          hint={fieldState.error?.message ?? hint}
        />
      )}
    />
  );
}
