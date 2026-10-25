import { z } from "zod";
import {
  LAB_TYPES,
  MODALITIES,
  OPENNESS,
  PLACE_STATUSES,
  PLACE_TYPES,
  REGULATION_LEVELS,
  TAG_IDS,
} from "@/config/taxonomy";

/**
 * One schema per CSV file in data/. A row that does not match stops the build,
 * with the file, the row number and the reason.
 */

const empty = (value: unknown) => (value === "" || value === null ? undefined : value);

const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "lowercase words joined by hyphens");
const partialDate = z.string().regex(/^\d{4}(-\d{2}(-\d{2})?)?$/, "YYYY, YYYY-MM or YYYY-MM-DD");
const fullDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD");
const url = z.url();
const latitude = z.coerce.number().min(-90).max(90);
const longitude = z.coerce.number().min(-180).max(180);
const optionalNumber = z.preprocess(empty, z.coerce.number().nonnegative().optional());
const optionalText = z.preprocess(empty, z.string().optional());
const optionalUrl = z.preprocess(empty, url.optional());
/** Date of the last human check of the row; empty = not verified yet. */
const checked = z.preprocess(empty, fullDate.optional());

export const labSchema = z.object({
  id: slug,
  name: z.string().min(1),
  country: z.string().length(2),
  city: z.string().min(1),
  lat: latitude,
  lon: longitude,
  type: z.enum(LAB_TYPES),
  founded: optionalNumber,
  url: optionalUrl,
  source: url,
  checked,
});

export const placeSchema = z.object({
  id: slug,
  name: z.string().min(1),
  type: z.enum(PLACE_TYPES),
  owner: z.string().min(1),
  city: z.string().min(1),
  country: z.string().length(2),
  lat: latitude,
  lon: longitude,
  status: z.enum(PLACE_STATUSES),
  capacity_mw: optionalNumber,
  note: optionalText,
  source: url,
  checked,
});

export const eventSchema = z.object({
  id: slug,
  date: partialDate,
  title: z.string().min(1),
  tag: z.enum(TAG_IDS),
  source: url,
});

export const modelSchema = z.object({
  id: slug,
  name: z.string().min(1),
  lab_id: slug,
  family: z.string().min(1),
  modality: z.enum(MODALITIES),
  openness: z.enum(OPENNESS),
  license: optionalText,
  released: z.preprocess(empty, partialDate.optional()),
  params_total_b: optionalNumber,
  params_active_b: optionalNumber,
  context_tokens: optionalNumber,
  price_in_usd_per_mtok: optionalNumber,
  price_out_usd_per_mtok: optionalNumber,
  note: optionalText,
  source: url,
  checked,
});

export const countrySchema = z.object({
  iso_numeric: z.string().regex(/^\d{3}$/, "three-digit ISO 3166-1 numeric code"),
  name: z.string().min(1),
  regulation: z.enum(REGULATION_LEVELS),
  note: z.string().min(1),
  source: url,
  checked,
});

export type Lab = z.infer<typeof labSchema>;
export type Place = z.infer<typeof placeSchema>;
export type TimelineEvent = z.infer<typeof eventSchema>;
export type Model = z.infer<typeof modelSchema>;
export type Country = z.infer<typeof countrySchema>;
