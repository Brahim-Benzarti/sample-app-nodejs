import { Status } from "./misc";

export interface WebHooks {
  data: Webhook[];
  meta: Meta;
}

export interface Meta {
  pagination: Pagination;
}

export interface Pagination {
  total:        number;
  count:        number;
  per_page:     number;
  current_page: number;
  total_pages:  number;
  links:        Links;
}

export interface Links {
  previous: string;
  current:  string;
  next:     string;
}

export interface Webhook {
  id:          number;
  client_id:   string;
  store_hash:  string;
  scope:       string;
  destination: string;
  headers:     Headers;
  is_active:   boolean;
  created_at:  number;
  updated_at:  number;
  addon:       Addon;
}

export interface Headers {
  [key: string]: unknown;
}

export interface Addon{
  step?: number;
  stats?: Status[];
  [key: string]: unknown;
}