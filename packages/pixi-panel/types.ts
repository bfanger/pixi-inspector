export type BridgeFn = <T>(code: string) => Promise<T>;

export type OutlinerNode = {
  id: string;
  name: string;
  leaf: boolean;
  active: boolean;
  visible: boolean;
  children?: OutlinerNode[];
};
