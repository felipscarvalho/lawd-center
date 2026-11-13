"use client";

import { useMemo, useState } from "react";
import { getLocalTimeZone, today } from "@internationalized/date";
import { useControlledState } from "@react-stately/utils";
import { Calendar as CalendarIcon } from "@untitledui/icons";
import type { DateRangePickerProps as AriaDateRangePickerProps, DateValue } from "react-aria-components";
import { DateRangePicker as AriaDateRangePicker, Dialog as AriaDialog, Group as AriaGroup, Popover as AriaPopover } from "react-aria-components";
import { Button, type ButtonProps } from "@/components/base/buttons/button";
import { InputDateBase } from "@/components/base/input/input-date";
import { type Moment, formatDate, moment, toCalendarDate } from "@/lib/moment";
import { cx } from "@/utils/cx";
import { RangeCalendar, RangePresetButton } from "./range-calendar";

const highlightedDates = [today(getLocalTimeZone())];

interface DateRangePickerProps extends AriaDateRangePickerProps<DateValue> {
    /** Controls the size of the trigger button that opens the calendar. */
    size?: ButtonProps["size"];
    /** The function to call when the apply button is clicked. */
    onApply?: () => void;
    /** The function to call when the cancel button is clicked. */
    onCancel?: () => void;
}

export const DateRangePicker = ({ value: valueProp, defaultValue, onChange, onApply, onCancel, size = "sm", ...props }: DateRangePickerProps) => {
    const [value, setValue] = useControlledState(valueProp, defaultValue || null, onChange);
    const [focusedValue, setFocusedValue] = useState<DateValue | null>(null);

    const formattedStartDate = value?.start ? formatDate(value.start.toDate(getLocalTimeZone())) : "Selecionar data";
    const formattedEndDate = value?.end ? formatDate(value.end.toDate(getLocalTimeZone())) : "Selecionar data";

    // Atalhos de período calculados com moment (semana no padrão pt-br, iniciando no domingo)
    const presets = useMemo(() => {
        const range = (start: Moment, end: Moment) => ({ start: toCalendarDate(start), end: toCalendarDate(end) });
        const now = moment();

        return {
            today: { label: "Hoje", value: range(now, now) },
            yesterday: { label: "Ontem", value: range(now.clone().subtract(1, "day"), now.clone().subtract(1, "day")) },
            thisWeek: { label: "Esta semana", value: range(now.clone().startOf("week"), now.clone().endOf("week")) },
            lastWeek: {
                label: "Semana passada",
                value: range(now.clone().subtract(1, "week").startOf("week"), now.clone().subtract(1, "week").endOf("week")),
            },
            thisMonth: { label: "Este mês", value: range(now.clone().startOf("month"), now.clone().endOf("month")) },
            lastMonth: {
                label: "Mês passado",
                value: range(now.clone().subtract(1, "month").startOf("month"), now.clone().subtract(1, "month").endOf("month")),
            },
            thisYear: { label: "Este ano", value: range(now.clone().startOf("year"), now.clone().endOf("year")) },
            lastYear: {
                label: "Ano passado",
                value: range(now.clone().subtract(1, "year").startOf("year"), now.clone().subtract(1, "year").endOf("year")),
            },
            allTime: { label: "Todo o período", value: range(moment("2000-01-01"), now) },
        };
    }, []);

    return (
        <AriaDateRangePicker aria-label="Selecionar período" shouldCloseOnSelect={false} {...props} value={value} onChange={setValue}>
            <AriaGroup>
                <Button size={size} color="secondary" iconLeading={CalendarIcon}>
                    {!value ? <span className="text-placeholder">Selecionar período</span> : `${formattedStartDate} – ${formattedEndDate}`}
                </Button>
            </AriaGroup>
            <AriaPopover
                placement="bottom right"
                offset={8}
                className={({ isEntering, isExiting }) =>
                    cx(
                        "origin-(--trigger-anchor-point) will-change-transform",
                        isEntering &&
                            "duration-150 ease-out animate-in fade-in placement-right:slide-in-from-left-0.5 placement-top:slide-in-from-bottom-0.5 placement-bottom:slide-in-from-top-0.5",
                        isExiting &&
                            "duration-100 ease-in animate-out fade-out placement-right:slide-out-to-left-0.5 placement-top:slide-out-to-bottom-0.5 placement-bottom:slide-out-to-top-0.5",
                    )
                }
            >
                <AriaDialog aria-label="Selecionar período" className="flex max-w-[calc(100vw-1.5rem)] rounded-2xl glass-strong ring ring-secondary_alt focus:outline-hidden">
                    {({ close }) => (
                        <>
                            <div className="hidden w-38 flex-col gap-0.5 border-r border-solid border-secondary p-3 lg:flex">
                                {Object.values(presets).map((preset) => (
                                    <RangePresetButton
                                        key={preset.label}
                                        value={preset.value}
                                        onClick={() => {
                                            setValue(preset.value);
                                            setFocusedValue(preset.value.start);
                                        }}
                                    >
                                        {preset.label}
                                    </RangePresetButton>
                                ))}
                            </div>
                            <div className="flex flex-col">
                                <RangeCalendar
                                    focusedValue={focusedValue}
                                    onFocusChange={setFocusedValue}
                                    highlightedDates={highlightedDates}
                                    presets={{
                                        lastWeek: presets.lastWeek,
                                        lastMonth: presets.lastMonth,
                                        lastYear: presets.lastYear,
                                    }}
                                />
                                <div className="flex justify-between gap-3 border-t border-secondary p-4">
                                    <div className="hidden items-center gap-2 md:flex">
                                        <InputDateBase slot="start" size="sm" />
                                        <div className="text-md text-quaternary">–</div>
                                        <InputDateBase slot="end" size="sm" />
                                    </div>
                                    <div className="grid w-full grid-cols-2 gap-3 md:flex md:w-auto">
                                        <Button
                                            size="sm"
                                            color="secondary"
                                            onClick={() => {
                                                onCancel?.();
                                                close();
                                            }}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            size="sm"
                                            color="primary"
                                            onClick={() => {
                                                onApply?.();
                                                close();
                                            }}
                                        >
                                            Aplicar
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </AriaDialog>
            </AriaPopover>
        </AriaDateRangePicker>
    );
};
