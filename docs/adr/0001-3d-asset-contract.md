# ADR 0001 — 3D asset contract: one neutral-white `Fabric` material

- Status: accepted
- Date: 2026-10-07

## Context

The hijab viewer lets a shopper rotate one shared model and switch between the store's real
colours. Colour is a flat value, not a texture. The model does not exist yet, so the contract
has to be fixed before any artist or stock asset is chosen — otherwise the recolour code
breaks the first time a real model arrives.

## Decision

Every model must expose **exactly one material named `Fabric`** whose base colour is **neutral
white** (`baseColorFactor: [1, 1, 1, 1]`). Recolouring is `material.color.set(hex)` at runtime,
on the material whose name matches `product.model.fabricMaterialName`.

The viewer sets the colour from the same state that drives the price and the order link, so a
model that violates the contract shows wrong colours rather than failing loudly.

## Consequences

- Swapping models is an **asset** change, not a code change (`product.model.glbUrl`).
- A pre-tinted base, or a second fabric material, silently breaks recolouring.
- No textures or UV work is needed for v1. Introducing prints/patterns means revisiting this ADR
  (texture swapping, UVs, and a bigger payload).
- `public/models/hijab.glb` (9,896 bytes) is a generated placeholder that satisfies the contract;
  `scripts/make-placeholder-model.mts` asserts material count, name, and white base.
