import type { Editor } from "@tiptap/core";
import { FloatingMenu } from "@tiptap/react/menus";
import { exitSuggestion } from "@tiptap/suggestion";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useT } from "@lattice-php/ui/i18n";
import { ToolbarIconButton } from "../toolbar-button";
import { BlockMenu, blockOptionDomId } from "./block-menu";
import {
  SLASH_MENU_PLUGIN_KEY,
  type SlashMenuHandle,
  type SlashMenuSuggestionProps,
} from "./slash-extension";
import { filterBlockCommands } from "./filter";

type Session = Pick<SlashMenuSuggestionProps, "items" | "query" | "command">;

// Module-level so the object identity is stable: FloatingMenu dispatches an
// update transaction whenever `options` changes, and with the editor's
// shouldRerenderOnTransaction that would loop a fresh inline object forever.
const PLUS_BUTTON_POSITION: React.ComponentProps<typeof FloatingMenu>["options"] = {
  placement: "left",
  offset: 4,
  flip: false,
};

export function BlockMenuController({
  editor,
  handleRef,
}: {
  editor: Editor;
  handleRef: React.RefObject<SlashMenuHandle | null>;
}) {
  const { t } = useT("lattice");
  const menuId = useId();
  const [session, setSession] = useState<Session | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  // The suggestion plugin mounts this element into document.body and owns its
  // positioning; React only portals the menu content into it.
  const [container] = useState(() => {
    const element = document.createElement("div");

    element.className = "z-lt-popover";

    return element;
  });
  const unmountRef = useRef<(() => void) | null>(null);

  const filtered = useMemo(
    () =>
      session
        ? filterBlockCommands(session.items, session.query, editor, (key, fallback) =>
            t(`form.editor.${key}`, fallback),
          )
        : [],
    [session, editor, t],
  );

  const filteredRef = useRef(filtered);
  const activeIndexRef = useRef(activeIndex);
  const sessionRef = useRef(session);

  useEffect(() => {
    filteredRef.current = filtered;
    activeIndexRef.current = activeIndex;
    sessionRef.current = session;
  });

  useEffect(() => {
    handleRef.current = {
      onStart: (props) => {
        setSession({ items: props.items, query: props.query, command: props.command });
        setActiveIndex(0);
        unmountRef.current = props.mount(container);
      },
      onUpdate: (props) => {
        if (props.query !== sessionRef.current?.query) {
          setActiveIndex(0);
        }

        setSession({ items: props.items, query: props.query, command: props.command });
      },
      onKeyDown: ({ view, event }) => {
        if (event.key === "Escape") {
          exitSuggestion(view, SLASH_MENU_PLUGIN_KEY);

          return true;
        }

        const items = filteredRef.current;

        if (items.length === 0) {
          return false;
        }

        if (event.key === "ArrowDown") {
          setActiveIndex((index) => Math.min(items.length - 1, index + 1));

          return true;
        }

        if (event.key === "ArrowUp") {
          setActiveIndex((index) => Math.max(0, index - 1));

          return true;
        }

        if (event.key === "Enter") {
          const item = items[activeIndexRef.current];

          if (item) {
            sessionRef.current?.command(item);
          }

          return true;
        }

        return false;
      },
      onExit: () => {
        unmountRef.current?.();
        unmountRef.current = null;
        setSession(null);
      },
    };

    return () => {
      handleRef.current = null;
      unmountRef.current?.();
      unmountRef.current = null;
    };
  }, [container, handleRef]);

  useEffect(() => {
    const dom = editor.view.dom;

    if (!session) {
      dom.removeAttribute("aria-controls");
      dom.removeAttribute("aria-activedescendant");

      return;
    }

    dom.setAttribute("aria-controls", menuId);

    const active = filtered[activeIndex];

    if (active) {
      dom.setAttribute("aria-activedescendant", blockOptionDomId(menuId, active.key));
    } else {
      dom.removeAttribute("aria-activedescendant");
    }
  }, [session, filtered, activeIndex, editor, menuId]);

  return (
    <>
      {createPortal(
        session && (
          <BlockMenu
            activeIndex={activeIndex}
            id={menuId}
            items={filtered}
            onHighlight={setActiveIndex}
            onSelect={(item) => session.command(item)}
          />
        ),
        container,
      )}
      <FloatingMenu editor={editor} options={PLUS_BUTTON_POSITION}>
        <ToolbarIconButton
          icon="plus"
          label={t("form.editor.add-block", "Add block")}
          onClick={() => editor.chain().focus().insertContent("/").run()}
          testId="editor-add-block"
        />
      </FloatingMenu>
    </>
  );
}
