import { ComponentPropsMap } from './generated';
declare module "@lattice-php/core" {
    interface ComponentProps extends ComponentPropsMap {
    }
}
export type { Tree, TreeNodeData, TreeNodeType } from './generated';
