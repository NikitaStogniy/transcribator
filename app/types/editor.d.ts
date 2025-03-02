declare module "@editorjs/header" {
  import { BlockTool, BlockToolData } from "@editorjs/editorjs";
  export default class Header implements BlockTool {
    constructor({ data, config, api, readOnly }: any);
    render(): HTMLElement;
    save(block: HTMLElement): BlockToolData;
  }
}

declare module "@editorjs/list" {
  import { BlockTool, BlockToolData } from "@editorjs/editorjs";
  export default class List implements BlockTool {
    constructor({ data, config, api, readOnly }: any);
    render(): HTMLElement;
    save(block: HTMLElement): BlockToolData;
  }
}

declare module "@editorjs/paragraph" {
  import { BlockTool, BlockToolData } from "@editorjs/editorjs";
  export default class Paragraph implements BlockTool {
    constructor({ data, config, api, readOnly }: any);
    render(): HTMLElement;
    save(block: HTMLElement): BlockToolData;
  }
}

declare module "@editorjs/checklist" {
  import { BlockTool, BlockToolData } from "@editorjs/editorjs";
  export default class Checklist implements BlockTool {
    constructor({ data, config, api, readOnly }: any);
    render(): HTMLElement;
    save(block: HTMLElement): BlockToolData;
  }
}

declare module "@editorjs/quote" {
  import { BlockTool, BlockToolData } from "@editorjs/editorjs";
  export default class Quote implements BlockTool {
    constructor({ data, config, api, readOnly }: any);
    render(): HTMLElement;
    save(block: HTMLElement): BlockToolData;
  }
}

declare module "@editorjs/simple-image" {
  import { BlockTool, BlockToolData } from "@editorjs/editorjs";
  export default class SimpleImage implements BlockTool {
    constructor({ data, config, api, readOnly }: any);
    render(): HTMLElement;
    save(block: HTMLElement): BlockToolData;
  }
}
