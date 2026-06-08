import { createLatticePlugin, eagerComponent } from "@/lattice/core/registry";
import BadgeComponent from "./badge";
import ButtonComponent from "./button";
import CardComponent from "./card";
import FragmentComponent from "./fragment";
import GridComponent from "./grid";
import HeadingComponent from "./heading";
import LinkComponent from "./link";
import ModalComponent from "./modal";
import StackComponent from "./stack";
import TabComponent, { TabsComponent } from "./tabs";
import TextComponent from "./text";

export const coreComponents = createLatticePlugin({
  components: {
    badge: eagerComponent(BadgeComponent),
    button: eagerComponent(ButtonComponent),
    card: eagerComponent(CardComponent),
    fragment: eagerComponent(FragmentComponent),
    grid: eagerComponent(GridComponent),
    heading: eagerComponent(HeadingComponent),
    link: eagerComponent(LinkComponent),
    modal: eagerComponent(ModalComponent),
    stack: eagerComponent(StackComponent),
    tab: eagerComponent(TabComponent),
    tabs: eagerComponent(TabsComponent),
    text: eagerComponent(TextComponent),
  },
  name: "lattice/core",
});
