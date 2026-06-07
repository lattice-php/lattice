import { createLatticePlugin, eagerComponent } from "@/lattice/core/registry";
import BadgeComponent from "./badge";
import ButtonComponent from "./button";
import CardComponent from "./card";
import GridComponent from "./grid";
import HeadingComponent from "./heading";
import LinkComponent from "./link";
import StackComponent from "./stack";
import TabComponent, { TabsComponent } from "./tabs";
import TextComponent from "./text";

export const coreComponents = createLatticePlugin({
  components: {
    badge: eagerComponent(BadgeComponent),
    button: eagerComponent(ButtonComponent),
    card: eagerComponent(CardComponent),
    grid: eagerComponent(GridComponent),
    heading: eagerComponent(HeadingComponent),
    link: eagerComponent(LinkComponent),
    stack: eagerComponent(StackComponent),
    tab: eagerComponent(TabComponent),
    tabs: eagerComponent(TabsComponent),
    text: eagerComponent(TextComponent),
  },
  name: "lattice/core",
});
