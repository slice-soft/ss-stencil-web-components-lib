export type SsCheckedChangeEvent = {
  xId?: string;
  name?: string;
  value?: string;
  checked: boolean;
};

export type SsInputValueEvent = { xId?: string; value: string };

export type InputStyle = 'solid' | 'outline' | 'underline';
