export interface Softkey {
  label: string;
  callback(): Promise<void>;
}
