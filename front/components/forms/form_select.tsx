"use client";

import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { Select, type SelectItemType, type SelectProps } from "@/components/base/select/select";

type FormSelectProps<T extends FieldValues> = Omit<
  SelectProps,
  "children" | "items" | "selectedKey" | "onSelectionChange" | "isInvalid"
> & {
  control: Control<T>;
  name: Path<T>;
  items: SelectItemType[];
  /** Ids numéricos (ex.: diretorias) voltam como número para o formulário */
  valueType?: "string" | "number";
  /** Chamado depois de mudar o valor (ex.: limpar um campo que depende deste) */
  onValueChange?: () => void;
};

/** Select ligado ao react-hook-form; sem seleção o valor é null */
export function FormSelect<T extends FieldValues>({
  control,
  name,
  items,
  hint,
  valueType = "string",
  onValueChange,
  ...props
}: FormSelectProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Select
          {...props}
          items={items}
          selectedKey={field.value ?? null}
          onSelectionChange={(key) => {
            field.onChange(key === null ? null : valueType === "number" ? Number(key) : String(key));
            onValueChange?.();
          }}
          isInvalid={Boolean(fieldState.error)}
          hint={fieldState.error?.message ?? hint}
        >
          {(item) => <Select.Item id={item.id} label={item.label} supportingText={item.supportingText} />}
        </Select>
      )}
    />
  );
}
