"use client";

import { useState } from "react";
import { ComboBox } from "@/components/base/select/combobox";
import { Select } from "@/components/base/select/select";
import { useUsers } from "@/hooks/administration/use_users";
import { useDebouncedValue } from "@/hooks/use_debounced_value";

interface UserSearchComboBoxProps {
  label: string;
  /** Id da pessoa escolhida */
  value: number | null | undefined;
  onChange: (userId: number | undefined) => void;
  placeholder?: string;
  isInvalid?: boolean;
  hint?: string;
}

/**
 * Escolha de uma pessoa ativa. A lista de usuários é paginada, então o texto digitado vai ao backend
 * (depois de uma pausa) e o campo mostra as primeiras pessoas encontradas.
 */
export function UserSearchComboBox({
  label,
  value,
  onChange,
  placeholder = "Buscar pelo nome",
  isInvalid,
  hint,
}: UserSearchComboBoxProps) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim());
  const users = useUsers({ active: true, search: debouncedSearch || undefined, perPage: 20 });

  const items = (users.data?.data ?? []).map((user) => ({
    id: user.id,
    label: user.fullName,
    supportingText: user.email,
  }));

  return (
    <ComboBox
      label={label}
      placeholder={placeholder}
      shortcut={false}
      onInputChange={setSearch}
      items={items}
      selectedKey={value ?? null}
      onSelectionChange={(key) => onChange(key === null ? undefined : Number(key))}
      isInvalid={isInvalid}
      hint={hint}
    >
      {(item) => <Select.Item id={item.id} label={item.label} supportingText={item.supportingText} />}
    </ComboBox>
  );
}
