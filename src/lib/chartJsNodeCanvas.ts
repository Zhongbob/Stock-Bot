import { ChartJSNodeCanvas } from 'chartjs-node-canvas'
import type { ChartConfiguration } from 'chart.js'
import { createRequire } from 'module'
import { readFileSync } from 'fs'
import { dirname } from 'path'
import {
  toDate, parse, parseISO, isValid, format,
  addYears, addQuarters, addMonths, addWeeks, addDays, addHours, addMinutes, addSeconds, addMilliseconds,
  differenceInYears, differenceInQuarters, differenceInMonths, differenceInWeeks, differenceInDays,
  differenceInHours, differenceInMinutes, differenceInSeconds, differenceInMilliseconds,
  startOfYear, startOfQuarter, startOfMonth, startOfWeek, startOfDay, startOfHour, startOfMinute, startOfSecond,
  endOfYear, endOfQuarter, endOfMonth, endOfWeek, endOfDay, endOfHour, endOfMinute, endOfSecond
} from 'date-fns'

const _require = createRequire(import.meta.url)

const DATE_FNS_FORMATS = {
  datetime: 'MMM d, yyyy, h:mm:ss aaaa',
  millisecond: 'h:mm:ss.SSS aaaa',
  second: 'h:mm:ss aaaa',
  minute: 'h:mm aaaa',
  hour: 'ha',
  day: 'MMM d',
  week: 'PP',
  month: 'MMM yyyy',
  quarter: 'qqq - yyyy',
  year: 'yyyy',
}

const defaultConfiguration: ChartConfiguration = {
    type: 'candlestick',
    options: {
      
      responsive: false,
      scales: {
      x: {
        type: 'time',
        offset: false,
        bounds: "data",
        adapters: {
          date: {
            zone: 'GMT+8'
          }
        },
        time: {
          unit: 'minute',
        }
      }
    },
      plugins: {
        
      }
    }
}

const width = 800
const height = 500
const chartJSNodeCanvas = new ChartJSNodeCanvas({ 
  width, 
  height,
  chartCallback: (ChartJS: any) => {
    // Load chartjs-chart-financial in forced-CJS mode.
    // Both it and chartjs-adapter-date-fns have "type":"module" with no "require"
    // export condition. Node.js 22.12+ loads them as ESM via require(esm), where
    // `exports`/`module` are undefined. Their UMD wrappers then fall through to
    // the global-variable path: factory(global.Chart, global.Chart.helpers).
    // global.Chart.helpers is undefined (chart.js doesn't expose helpers on Chart),
    // causing "Cannot read properties of undefined (reading 'clipArea')".
    // Executing the source via new Function() with explicit CJS vars forces the
    // UMD to take its CJS branch, getting valid chart.js and helpers references.
    const financialPath = _require.resolve('chartjs-chart-financial')
    const financialSrc = readFileSync(financialPath, 'utf8')
    const fakeMod = { exports: {} as any }
    const loadPlugin = new Function('exports', 'module', 'require', '__filename', '__dirname', financialSrc)
    loadPlugin(fakeMod.exports, fakeMod, _require, financialPath, dirname(financialPath))

    ChartJS._adapters._date.override({
      _id: 'date-fns',
      formats: () => DATE_FNS_FORMATS,
      parse(value: any, fmt?: string): number | null {
        if (value === null || value === undefined) return null
        const type = typeof value
        if (type === 'number' || value instanceof Date) {
          value = toDate(value)
        } else if (type === 'string') {
          value = typeof fmt === 'string' ? parse(value, fmt, new Date(), (this as any).options) : parseISO(value, (this as any).options)
        }
        return isValid(value) ? (value as Date).getTime() : null
      },
      format(time: number, fmt: string): string {
        return format(time, fmt, (this as any).options)
      },
      add(time: number, amount: number, unit: string): number {
        switch (unit) {
          case 'millisecond': return addMilliseconds(time, amount).getTime()
          case 'second': return addSeconds(time, amount).getTime()
          case 'minute': return addMinutes(time, amount).getTime()
          case 'hour': return addHours(time, amount).getTime()
          case 'day': return addDays(time, amount).getTime()
          case 'week': return addWeeks(time, amount).getTime()
          case 'month': return addMonths(time, amount).getTime()
          case 'quarter': return addQuarters(time, amount).getTime()
          case 'year': return addYears(time, amount).getTime()
          default: return time
        }
      },
      diff(a: number, b: number, unit: string): number {
        switch (unit) {
          case 'millisecond': return differenceInMilliseconds(a, b)
          case 'second': return differenceInSeconds(a, b)
          case 'minute': return differenceInMinutes(a, b)
          case 'hour': return differenceInHours(a, b)
          case 'day': return differenceInDays(a, b)
          case 'week': return differenceInWeeks(a, b)
          case 'month': return differenceInMonths(a, b)
          case 'quarter': return differenceInQuarters(a, b)
          case 'year': return differenceInYears(a, b)
          default: return 0
        }
      },
      startOf(time: number, unit: string, weekday?: number): number {
        switch (unit) {
          case 'second': return startOfSecond(time).getTime()
          case 'minute': return startOfMinute(time).getTime()
          case 'hour': return startOfHour(time).getTime()
          case 'day': return startOfDay(time).getTime()
          case 'week': return startOfWeek(time).getTime()
          case 'isoWeek': return startOfWeek(time, { weekStartsOn: +(weekday ?? 0) as 0|1|2|3|4|5|6 }).getTime()
          case 'month': return startOfMonth(time).getTime()
          case 'quarter': return startOfQuarter(time).getTime()
          case 'year': return startOfYear(time).getTime()
          default: return time
        }
      },
      endOf(time: number, unit: string): number {
        switch (unit) {
          case 'second': return endOfSecond(time).getTime()
          case 'minute': return endOfMinute(time).getTime()
          case 'hour': return endOfHour(time).getTime()
          case 'day': return endOfDay(time).getTime()
          case 'week': return endOfWeek(time).getTime()
          case 'month': return endOfMonth(time).getTime()
          case 'quarter': return endOfQuarter(time).getTime()
          case 'year': return endOfYear(time).getTime()
          default: return time
        }
      },
    })
  },

 })


export default chartJSNodeCanvas
export {defaultConfiguration}