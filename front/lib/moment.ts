import { type CalendarDate, parseDate } from "@internationalized/date";
import moment, { type Moment } from "moment";
import "moment/locale/pt-br";

// Locale padrão da aplicação; importar moment sempre deste arquivo para garantir o pt-br
moment.locale("pt-br");

export const DATE_FORMAT = "DD/MM/YYYY";

type DateInput = Moment | Date | string;

// Formata uma data no padrão brasileiro (ex.: 25/12/2026)
export const formatDate = (date: DateInput, format = DATE_FORMAT) => moment(date).format(format);

// Converte para o tipo de data usado pelos componentes do react-aria (DatePicker, Calendar)
export const toCalendarDate = (date: DateInput): CalendarDate => parseDate(moment(date).format("YYYY-MM-DD"));

export { moment };
export type { Moment };
