# Scene composition revision — 2026-09-12

The isolated circular display bases have been replaced with continuous ground, architectural context and layered horizons. The game renders real GLB geometry with embedded albedo maps; no scenic screenshot stands in for the interactive world.

| Chapter | Composition |
| --- | --- |
| Heaven council | Empty monumental threshold, broad stairs, eroded ridges; no depiction of God |
| Ruined home | Broken courtyard surrounded by a street, roof timbers, household fragments, seated Job |
| Friends | Paved courtyard, three-bay colonnade, sagging woven shade and olive tree |
| Protest | A lone figure and path facing an empty city gate, colder light |
| Storm | Connected shore, reed bank, cliffs and open sea, enlarged untamed creatures |
| Return | An old garden, low shared table, remaining broken walls and new growth |

The reader appears beside the focal subject in a translucent panel. Scene expansion hides that panel. On narrow screens, the scene and reader stack vertically. Character investigations use camera angles facing the speaker.

Rendering uses per-chapter sky and fog colours, directional key and fill, contact shadows, packed stone/wood/cloth albedo maps, gentle sky movement and animated water. Reduced-motion settings freeze atmospheric movement. The visual style remains sculptural; characters do not have skeletal animation.

Master: public/assets/job-worlds.glb, 4,740,132 bytes, 2,817 mesh objects in Blender. Runtime GLBs contain one chapter each, about 0.55–1.45 MB. Shared source meshes are batched by material at runtime. The app checks texture loading instead of silently displaying white materials. Hosting CSP permits local blob image decoding required by GLTFLoader.

Reconstruction order in Blender 5.2: create-worlds.py, compose-environments.py, refine-environments.py, verify-architecture.py. The final pass removed 62 unsupported wall blocks. Use the portable repository's scripts/split-worlds.mjs to prune unrelated nodes/materials/textures from each runtime chapter.
