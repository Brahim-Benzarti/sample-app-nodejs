export interface WebHookPayload {
  store_id: string;
  producer: string;
  scope:    string;
  data:     Data;
  hash:     string;
}

export interface Data {
  type: string;
  id:   number;
}