export interface BCCustomers {
  data: Datum[];
  meta?: Meta;
}

export interface Datum {
  id:                                           number;
  address_count:                                number;
  email:                                        string;
  first_name:                                   string;
  last_name:                                    string;
  company:                                      string;
  phone:                                        string;
  notes:                                        string;
  tax_exempt_category:                          string;
  customer_group_id:                            number;
  addresses:                                    Address[];
  store_credit_amounts:                         StoreCreditAmount[];
  accepts_product_review_abandoned_cart_emails: boolean;
  channel_ids:                                  number[];
  shopper_profile_id:                           string;
  segment_ids:                                  string[];
  attributes:                                   any[];
  authentication:                               Authentication;
  registration_ip_address:                      string;
  date_created:                                 Date;
  date_modified:                                Date;
  attribute_count:                              number;
  form_fields:                                  any[];
  origin_channel_id:                            number;
}

export interface Authentication {
  force_password_reset: boolean;
  [key: string]:        unknown;
}

export interface Address {
  first_name:        string;
  last_name:         string;
  address1:          string;
  address2:          string;
  city:              string;
  state_or_province: string;
  postal_code:       string;
  country_code:      string;
  phone:             string;
  address_type:      string;
  customer_id:       number;
  id:                number;
  country:           string;
}

export interface StoreCreditAmount {
  amount: number;
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
