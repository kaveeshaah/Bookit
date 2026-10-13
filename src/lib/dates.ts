export const APP_TIME_ZONE = "Asia/Colombo";

const dateFmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: APP_TIME_ZONE, day: "numeric", month: "short", year: "numeric",
});
const timeFmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: APP_TIME_ZONE, hour: "numeric", minute: "2-digit", hour12: true,
});
const isoDateFmt = new Intl.DateTimeFormat("en-CA", { timeZone: APP_TIME_ZONE }); // YYYY-MM-DD

export const formatDate = (d: Date) => dateFmt.format(d);
export const formatTime = (d: Date) => timeFmt.format(d);
export const toDateString = (d: Date) => isoDateFmt.format(d);
export const todayString = () => toDateString(new Date());

export function shiftDate(dateStr: string, days: number): string {
    const d = new Date(`${dateStr}T12:00:00+05:30`);
    return toDateString(new Date(d.getTime() + days * 86_400_000));
}

export function formatRange(start: Date, end: Date): string {
    const sameDay = formatDate(start) === formatDate(end);
    return sameDay
        ? `${formatDate(start)}, ${formatTime(start)} – ${formatTime(end)}`
        : `${formatDate(start)} ${formatTime(start)} – ${formatDate(end)} ${formatTime(end)}`;
}