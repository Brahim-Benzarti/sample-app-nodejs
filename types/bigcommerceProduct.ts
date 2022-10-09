export interface BCProducts {
  data: Datum[];
  meta?: Meta;
}
export interface BCProduct {
  data: Datum;
  meta?: Meta;
}
export interface Datum {
  id:                              number;
  name:                            string;
  type:                            string;
  sku:                             string;
  description:                     string;
  weight:                          number;
  width:                           number;
  depth:                           number;
  height:                          number;
  price:                           number;
  cost_price:                      number;
  retail_price:                    number;
  sale_price:                      number;
  map_price:                       number;
  tax_class_id:                    number;
  product_tax_code:                string;
  categories:                      number[];
  brand_id:                        number;
  inventory_level:                 number;
  inventory_warning_level:         number;
  inventory_tracking:              string;
  fixed_cost_shipping_price:       number;
  is_free_shipping:                boolean;
  is_visible:                      boolean;
  is_featured:                     boolean;
  related_products:                number[];
  warranty:                        string;
  bin_picking_number:              string;
  layout_file:                     string;
  upc:                             string;
  search_keywords:                 string;
  availability_description:        string;
  availability:                    string;
  gift_wrapping_options_type:      string;
  gift_wrapping_options_list:      number[];
  sort_order:                      number;
  condition:                       string;
  is_condition_shown:              boolean;
  order_quantity_minimum:          number;
  order_quantity_maximum:          number;
  page_title:                      string;
  meta_keywords:                   string[];
  meta_description:                string;
  view_count:                      number;
  preorder_release_date:           Date;
  preorder_message:                string;
  is_preorder_only:                boolean;
  is_price_hidden:                 boolean;
  price_hidden_label:              string;
  custom_url:                      CustomURL;
  open_graph_type:                 string;
  open_graph_title:                string;
  open_graph_description:          string;
  open_graph_use_meta_description: boolean;
  open_graph_use_product_name:     boolean;
  open_graph_use_image:            boolean;
  gtin:                            string;
  mpn:                             string;
  reviews_rating_sum:              number;
  reviews_count:                   number;
  total_sold:                      number;
  custom_fields:                   CustomField[];
  bulk_pricing_rules:              BulkPricingRule[];
  images:                          Image[];
  videos:                          Video[];
  date_created:                    Date;
  date_modified:                   Date;
  base_variant_id:                 number;
  calculated_price:                number;
  options:                         Option[];
  modifiers:                       Modifier[];
  option_set_id:                   number;
  option_set_display:              string;
  variants:                        Variant[];
}

export interface BulkPricingRule {
  id:           number;
  quantity_min: number;
  quantity_max: number;
  type:         string;
  amount:       number;
}

export interface CustomField {
  id:    number;
  name:  string;
  value: string;
}

export interface CustomURL {
  url:           string;
  is_customized: boolean;
}

export interface Image {
  image_file:    string;
  is_thumbnail:  boolean;
  sort_order:    number;
  description:   string;
  image_url:     string;
  id:            number;
  product_id:    number;
  url_zoom:      string;
  url_standard:  string;
  url_thumbnail: string;
  url_tiny:      string;
  date_modified: Date;
}

export interface Modifier {
  type:          string;
  required:      boolean;
  sort_order:    number;
  config:        Config;
  display_name:  string;
  id:            number;
  product_id:    number;
  name:          string;
  option_values: ModifierOptionValue[];
}

export interface Config {
  default_value:                  string;
  checked_by_default:             boolean;
  checkbox_label:                 string;
  date_limited:                   boolean;
  date_limit_mode:                string;
  date_earliest_value:            Date;
  date_latest_value:              Date;
  file_types_mode:                string;
  file_types_supported:           string[];
  file_types_other:               string[];
  file_max_size:                  number;
  text_characters_limited:        boolean;
  text_min_length:                number;
  text_max_length:                number;
  text_lines_limited:             boolean;
  text_max_lines:                 number;
  number_limited:                 boolean;
  number_limit_mode:              string;
  number_lowest_value:            number;
  number_highest_value:           number;
  number_integers_only:           boolean;
  product_list_adjusts_inventory: boolean;
  product_list_adjusts_pricing:   boolean;
  product_list_shipping_calc:     string;
}

export interface ModifierOptionValue {
  is_default: boolean;
  label:      string;
  sort_order: number;
  value_data: ValueData;
  adjusters:  Adjusters;
  id:         number;
  option_id:  number;
}

export interface Adjusters {
  price:               Price;
  weight:              Price;
  image_url:           string;
  purchasing_disabled: PurchasingDisabled;
}

export interface Price {
  adjuster:       string;
  adjuster_value: number;
}

export interface PurchasingDisabled {
  status:  boolean;
  message: string;
}

export interface ValueData {
}

export interface Option {
  id:            number;
  product_id:    number;
  display_name:  string;
  type:          string;
  config:        Config;
  sort_order:    number;
  option_values: OptionValues;
}

export interface OptionValues {
  is_default: boolean;
  label:      string;
  sort_order: number;
  value_data: ValueData;
  id:         number;
}

export interface Variant {
  cost_price:                  number;
  price:                       number;
  sale_price:                  number;
  retail_price:                number;
  weight:                      number;
  width:                       number;
  height:                      number;
  depth:                       number;
  is_free_shipping:            boolean;
  fixed_cost_shipping_price:   number;
  purchasing_disabled:         boolean;
  purchasing_disabled_message: string;
  upc:                         string;
  inventory_level:             number;
  inventory_warning_level:     number;
  bin_picking_number:          string;
  mpn:                         string;
  gtin:                        string;
  id:                          number;
  product_id:                  number;
  sku:                         string;
  sku_id:                      number;
  option_values:               VariantOptionValue[];
  calculated_price:            number;
  calculated_weight:           number;
}

export interface VariantOptionValue {
  option_display_name: string;
  label:               string;
  id:                  number;
  option_id:           number;
}

export interface Video {
  title:       string;
  description: string;
  sort_order:  number;
  type:        string;
  video_id:    string;
  id:          number;
  product_id:  number;
  length:      string;
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
