import { type Lead, type LeadStatus, leadStatusLabel } from './lead.model';
import { longMonth } from './site-days';

/** What the Leads page is narrowed to; empty means "any". */
export interface ILeadFilter {
  readonly status: LeadStatus | '';
  readonly eventType: string;
  readonly groupSize: string;
  /** `YYYY-MM`. */
  readonly month: string;
  /** Part of a name, phone number or email. */
  readonly search: string;
}

/** Nothing filtered. */
export const NO_LEAD_FILTER: ILeadFilter = {
  status: '',
  eventType: '',
  groupSize: '',
  month: '',
  search: '',
};

/** One choice in a filter's list. */
export interface IFilterOption {
  readonly value: string;
  readonly label: string;
}

/** The choices each filter offers, from the leads themselves. */
export interface ILeadFilterOptions {
  readonly eventTypes: readonly IFilterOption[];
  readonly groupSizes: readonly IFilterOption[];
  readonly months: readonly IFilterOption[];
}

/** The CSV's columns, in order: heading and how each lead fills it. */
const CSV_COLUMNS: readonly (readonly [string, (lead: Lead) => string])[] = [
  ['Received', (lead) => lead.received],
  ['Status', (lead) => leadStatusLabel(lead.status)],
  ['Name', (lead) => lead.name],
  ['Phone', (lead) => lead.phone],
  ['Email', (lead) => lead.email],
  ['Looking for', (lead) => lead.need],
  ['Event type', (lead) => lead.eventType],
  ['Experience', (lead) => lead.experience],
  ['Group size', (lead) => lead.groupSize],
  ['Date wanted', (lead) => lead.date],
  ['Message', (lead) => lead.message],
];

/**
 * Characters a spreadsheet reads as the start of a formula (or a cell break before one). A
 * visitor wrote these cells, so a message like `=HYPERLINK(…)` must stay text when the owner
 * opens the file (CSV injection, OWASP).
 */
const FORMULA_START = /^[=+\-@\t\r]/;

/** Spreadsheets on Windows read a CSV as UTF-8 only with this mark at the start. */
const BYTE_ORDER_MARK = '﻿';

/** The CSV's media type. */
export const LEADS_CSV_TYPE = 'text/csv;charset=utf-8';

function contains(value: string, search: string): boolean {
  return value.toLocaleLowerCase('en-IN').includes(search);
}

/** A filter left empty matches everything. */
function matches(chosen: string, value: string): boolean {
  return chosen === '' || chosen === value;
}

function found(lead: Lead, search: string): boolean {
  const digits = search.replace(/\D/g, '');
  return (
    search === '' ||
    contains(lead.name, search) ||
    contains(lead.email, search) ||
    (digits !== '' && lead.phoneDigits.includes(digits))
  );
}

/**
 * @param leads Every lead.
 * @param filter What to narrow to.
 * @returns The leads that match every part of the filter, in the same order.
 */
export function filterLeads(leads: readonly Lead[], filter: ILeadFilter): Lead[] {
  const search = filter.search.trim().toLocaleLowerCase('en-IN');
  return leads.filter(
    (lead) =>
      matches(filter.status, lead.status) &&
      matches(filter.eventType, lead.eventType) &&
      matches(filter.groupSize, lead.groupSize) &&
      matches(filter.month, lead.month) &&
      found(lead, search),
  );
}

function distinct(values: readonly string[], label: (value: string) => string): IFilterOption[] {
  return [...new Set(values.filter((value) => value !== ''))]
    .sort((left, right) => left.localeCompare(right))
    .map((value) => ({ value, label: label(value) }));
}

/** @returns Each filter's choices: only values some lead has, so no choice comes up empty. */
export function filterOptions(leads: readonly Lead[]): ILeadFilterOptions {
  return {
    eventTypes: distinct(
      leads.map((lead) => lead.eventType),
      (value) => value,
    ),
    groupSizes: distinct(
      leads.map((lead) => lead.groupSize),
      (value) => value,
    ),
    // Newest month first, like the list.
    months: distinct(
      leads.map((lead) => lead.month),
      longMonth,
    ).reverse(),
  };
}

function cell(value: string): string {
  const safe = FORMULA_START.test(value) ? `'${value}` : value;
  return `"${safe.replaceAll('"', '""')}"`;
}

/**
 * @param leads The leads to export, in order.
 * @returns A CSV file's text, every cell quoted and formula-safe.
 */
export function leadsCsv(leads: readonly Lead[]): string {
  const rows = [
    CSV_COLUMNS.map(([heading]) => heading),
    ...leads.map((lead) => CSV_COLUMNS.map(([, value]) => value(lead))),
  ];
  return `${BYTE_ORDER_MARK}${rows.map((row) => row.map(cell).join(',')).join('\r\n')}\r\n`;
}

/**
 * @param now When the file is made.
 * @returns Its name, e.g. `taal-yatra-leads-2026-11-18.csv`.
 */
export function leadsCsvName(now: Date): string {
  return `taal-yatra-leads-${now.toISOString().slice(0, 'YYYY-MM-DD'.length)}.csv`;
}
