---
paths:
  - 'packages/blocks/**'
---

# Blocks

## Blocks: bindings, frames, editing flag, committed dist and jsdom coverage
bind('field') marks only the node whose primary content shows that field (heading text, button label, image src, RichText document); one field, one node. Generic style (width, spacing, background, align, visibility, anchor) lives on the blocks.frame wrapper via BlockStyle/StyleClassMap — a block render never applies style itself. Renders receive BlockData::editing(): keep empty placeholder spots only while editing and prune them (and return '' from html()) for read-only output. packages/blocks/dist is force-allowed in .gitignore and must be rebuilt (npm run build:standalone --workspace @lattice-php/blocks) and committed with every change; CI typecheck, lattice:assets and the standalone-artifact test read it. Codecov's patch/javascript status only sees jsdom coverage — editor UI needs jsdom tests (block-editor.test.tsx with renderWithRegistry), browser tests alone leave the diff uncovered.
