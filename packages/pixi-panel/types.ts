export type Bridge = {
  eval<T>(code: string): Promise<T>;
};

export type OutlineNode = {
  name: string;
  length: number;
  expanded: boolean;
};
