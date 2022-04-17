export type Bridge = {
  inject(global: string, factory: Function): Promise<void>;
  execute<T>(code: string): Promise<T>;
};

export type OutlineNode = {
  id: string;
  name: string;
  leaf: boolean;
  active: boolean;
  children?: OutlineNode[];
};
